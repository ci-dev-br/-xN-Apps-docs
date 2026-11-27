import { generateKeyPairSync, sign } from 'crypto';
import { canonicalStringify, SnapshotService } from './snapshot.service';
import { DaoFullAuditedServiceBase } from './dao-full-audited-service-base';
import { FullAuditedEntity } from './entities';

class ScopedMockEntity extends FullAuditedEntity {
  nome?: string;
}

class ScopedMockService extends DaoFullAuditedServiceBase<ScopedMockEntity> {}

describe('SnapshotService & Segmentação por Chave de Acesso', () => {
  it('deve verificar assinatura ECDSA P-256 (IEEE P1363) do cliente com a chave pública da Credential', async () => {
    const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    const spkiBase64 = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');

    const savedSnaps: any[] = [];
    const snapRepoMock: any = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((d: any) => ({ ...d })),
      save: jest.fn(async (d: any) => {
        savedSnaps.push(d);
        return d;
      }),
    };
    const credentialRepoMock: any = {
      findOne: jest.fn().mockResolvedValue({
        id: 'cred-1',
        publicKey: spkiBase64,
        publicKeyAlgorithm: 'ECDSA-P256-SHA256',
      }),
    };

    const service = new SnapshotService(snapRepoMock, credentialRepoMock);

    const payloadData = { b: 2, a: 'teste', nested: { z: 1, m: true } };
    const { createHash } = await import('crypto');
    const payloadHash = createHash('sha256')
      .update(canonicalStringify(payloadData))
      .digest('hex');
    const signedAt = new Date().toISOString();
    const clientHash = createHash('sha256')
      .update(`|${payloadHash}|${signedAt}`)
      .digest('hex');

    const sigBuffer = sign(
      'sha256',
      Buffer.from(clientHash, 'utf8'),
      { key: privateKey, dsaEncoding: 'ieee-p1363' },
    );

    const reqMock: any = {
      chaveAcesso: 'cred-1',
      body: { data: payloadData },
      headers: {
        'x-access-key': 'cred-1',
        'x-snapshot-hash': clientHash,
        'x-snapshot-payload-hash': payloadHash,
        'x-snapshot-signature': sigBuffer.toString('base64url'),
        'x-snapshot-timestamp': signedAt,
        'x-snapshot-algorithm': 'ECDSA-P256-SHA256',
      },
    };

    await service.snapshot({ internalId: 'obj-1', ...payloadData }, reqMock);

    expect(savedSnaps.length).toBe(1);
    expect(savedSnaps[0].signatureVerified).toBe(true);
    expect(savedSnaps[0].payloadHash).toBe(payloadHash);
    expect(savedSnaps[0].hash).toBe(clientHash);
    expect(savedSnaps[0].createdBy).toEqual({ id: 'cred-1' });
  });

  it('deve marcar signatureVerified=false se o payload tiver sido adulterado em relação ao payloadHash assinado', async () => {
    const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    const spkiBase64 = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');

    const savedSnaps: any[] = [];
    const snapRepoMock: any = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((d: any) => ({ ...d })),
      save: jest.fn(async (d: any) => {
        savedSnaps.push(d);
        return d;
      }),
    };
    const credentialRepoMock: any = {
      findOne: jest.fn().mockResolvedValue({
        id: 'cred-1',
        publicKey: spkiBase64,
      }),
    };

    const service = new SnapshotService(snapRepoMock, credentialRepoMock);
    const { createHash } = await import('crypto');
    const originalData = { nome: 'Original' };
    const payloadHash = createHash('sha256')
      .update(canonicalStringify(originalData))
      .digest('hex');
    const signedAt = new Date().toISOString();
    const clientHash = createHash('sha256')
      .update(`|${payloadHash}|${signedAt}`)
      .digest('hex');
    const sigBuffer = sign(
      'sha256',
      Buffer.from(clientHash, 'utf8'),
      { key: privateKey, dsaEncoding: 'ieee-p1363' },
    );

    await service.snapshot(
      { internalId: 'obj-1', nome: 'Adulterado' },
      {
        chaveAcesso: 'cred-1',
        body: { data: { nome: 'Adulterado' } },
        headers: {
          'x-access-key': 'cred-1',
          'x-snapshot-hash': clientHash,
          'x-snapshot-payload-hash': payloadHash,
          'x-snapshot-signature': sigBuffer.toString('base64url'),
          'x-snapshot-timestamp': signedAt,
        },
      } as any,
    );

    expect(savedSnaps[0].signatureVerified).toBe(false);
  });

  it('deve filtrar obterLista segmentando por chaveAcesso atual via header x-access-scope', async () => {
    const snapMock: any = { snapshot: jest.fn() };
    const repoMock: any = {
      metadata: {
        columns: [
          { propertyName: 'internalId', type: 'uuid' },
          { propertyName: 'nome', type: 'varchar' },
        ],
        relations: [],
      },
      find: jest.fn().mockResolvedValue([]),
    };
    const service = new ScopedMockService(snapMock, repoMock);

    await service.obterLista(
      {},
      {
        user: { id: 'usr-1', roles: ['USER'] } as any,
        chaveAcesso: 'cred-atual',
        headers: { 'x-access-scope': 'current' },
      },
    );

    expect(repoMock.find).toHaveBeenCalledTimes(1);
    const findArgs = repoMock.find.mock.calls[0][0];
    expect(Array.isArray(findArgs.where)).toBe(true);
    expect(findArgs.where).toHaveLength(1);
    expect(findArgs.where[0].createdBy.id.value).toEqual(['cred-atual']);
    expect(findArgs.where[0].createdBy.identifiedUser.value).toBe('usr-1');
  });
});
