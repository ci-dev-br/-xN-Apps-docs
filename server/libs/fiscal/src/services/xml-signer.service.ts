import * as fs from 'fs';
import * as forge from 'node-forge';
import { SignedXml } from 'xml-crypto';
import { DOMParser } from '@xmldom/xmldom';

export class XmlSignerService {

  /**
   * Extrai a chave privada e o certificado público de um arquivo PFX (A1)
   */
  private extractKeysFromPfx(pfxPath: string, password: string) {
    const pfxData = fs.readFileSync(pfxPath, 'binary');
    const p12Asn1 = forge.asn1.fromDer(pfxData);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);

    let privateKeyPem = '';
    let certificatePem = '';

    // Vasculha os "safe bags" do PFX para achar chaves e certificados
    for (const safeBags of p12.safeContents) {
      for (const bag of safeBags.safeBags) {
        if (bag.type === forge.pki.oids.keyBag || bag.type === forge.pki.oids.pkcs8ShroudedKeyBag) {
          const key = bag.type === forge.pki.oids.pkcs8ShroudedKeyBag
            ? forge.pki.decryptPrivateKeyInfo(bag.asn1, password)
            : bag.key;
          privateKeyPem = forge.pki.privateKeyToPem(key as forge.pki.PrivateKey);
        } else if (bag.type === forge.pki.oids.certBag) {
          certificatePem = forge.pki.certificateToPem(bag.cert as forge.pki.Certificate);
        }
      }
    }

    if (!privateKeyPem || !certificatePem) {
      throw new Error('Falha ao extrair chaves do certificado PFX.');
    }

    return { privateKeyPem, certificatePem };
  }

  /**
   * Assina o XML
   * @param xmlString O XML em string
   * @param tagToSign A tag que contém o atributo ID (Ex: 'infNFe' ou 'Rps')
   */
  public signXml(xmlString: string, pfxPath: string, password: string, tagToSign: string = 'infNFe'): string {
    const { privateKeyPem, certificatePem } = this.extractKeysFromPfx(pfxPath, password);

    const sig = new SignedXml();

    // Algoritmos obrigatórios pela SEFAZ
    sig.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1'; // ou sha256 dependendo da prefeitura
    /* sig.addReference(
      //`//*[local-name(.)='${tagToSign}']`,
      /*  [
         'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
         'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
       ],
       'http://www.w3.org/2000/09/xmldsig#sha1' */
    // ); */

    // sig.signingKey = privateKeyPem;
    // sig.keyInfoProvider = new X509KeyInfoProvider(certificatePem);

    // Compute Signature (Gera o XML assinado)
    sig.computeSignature(xmlString, {
      location: { reference: `//*[local-name(.)='${tagToSign}']`, action: 'after' }
    });

    return sig.getSignedXml();
  }
}