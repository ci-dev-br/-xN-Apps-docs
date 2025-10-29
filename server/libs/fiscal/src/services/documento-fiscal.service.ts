import { DaoServiceBase } from "@ci/manager/dao/dao-service-base";
import { DocumentoFiscal } from "../models/documento-fiscal";
/**
 * ### Gestão de Documentos Fiscais: Gerenciar a emissão, o recebimento e o armazenamento de documentos fiscais eletrônicos (NF-e, NFC-e, 
 * ### CT-e, NFS-e, entre outros). O módulo deve ser capaz de se comunicar com os órgãos fiscais, gerar os arquivos XML, e garantir a 
 * ### assinatura digital.
 * 
 * # Doocumento Fiscal Service
 * Armazene, consulte, emita, crie modelos entre outras funcionalidades
 */
export class DoocumentoFiscalService extends DaoServiceBase<DocumentoFiscal> {
    /**
     * Obter por ID, recupera o objeto por seu ID padrão (`InternalID`).
     * @param id 
     * @param request 
     * @returns 
     */
    getById(id: string | string[], request?: any): Promise<DocumentoFiscal> {
        if (typeof id === 'string')
            return this._repo.findOneBy({
                internalId: id
            })
    }
}