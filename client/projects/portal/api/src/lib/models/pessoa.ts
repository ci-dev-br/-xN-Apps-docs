/* tslint:disable */
/* eslint-disable */
import { DocumentoIdentificacao } from '../models/documento-identificacao';
export interface IPessoa {
  createdAt?: string | null;
  createdBy?: {
} | null;
  documentos?: Array<DocumentoIdentificacao> | null;
  emailPessoal?: string | null;
  empresa?: string | null;
  endereco?: Array<string> | null;
  informacoesContato?: Array<string> | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: {
} | null;

  /**
   * Nome
   */
  nome?: string | null;
  nomeFantasia?: string | null;
  razaoSocial?: string | null;
  registroGeralRepublicaBrasileira?: string | null;
  registroGeralRepublicaBrasileiraOrgaoEmissorOrgaoEmissor: string;
  site?: string | null;

  /**
   * Sobrenome
   */
  sobrenome?: string | null;
  tenants?: Array<string> | null;
  tipoJuridico?: string | null;
}

export class Pessoa implements IPessoa {
  static typeName = 'Pessoa';
  private _createdAt?: string | null;
  public get createdAt(): string | null| undefined{ return this._createdAt; }
  public set createdAt(value: string | null| undefined){
    if(this._createdAt === value) return;
    this._createdAt = value;
  }
  private _createdBy?: {
} | null;
  public get createdBy(): {
} | null| undefined{ return this._createdBy; }
  public set createdBy(value: {
} | null| undefined){
    if(this._createdBy === value) return;
    this._createdBy = value;
  }
  private _documentos?: Array<DocumentoIdentificacao> | null;
  public get documentos(): Array<DocumentoIdentificacao> | null| undefined{ return this._documentos; }
  public set documentos(value: Array<DocumentoIdentificacao> | null| undefined){
    if(this._documentos === value) return;
    this._documentos = value;
  }
  private _emailPessoal?: string | null;
  public get emailPessoal(): string | null| undefined{ return this._emailPessoal; }
  public set emailPessoal(value: string | null| undefined){
    if(this._emailPessoal === value) return;
    this._emailPessoal = value;
  }
  private _empresa?: string | null;
  public get empresa(): string | null| undefined{ return this._empresa; }
  public set empresa(value: string | null| undefined){
    if(this._empresa === value) return;
    this._empresa = value;
  }
  private _endereco?: Array<string> | null;
  public get endereco(): Array<string> | null| undefined{ return this._endereco; }
  public set endereco(value: Array<string> | null| undefined){
    if(this._endereco === value) return;
    this._endereco = value;
  }
  private _informacoesContato?: Array<string> | null;
  public get informacoesContato(): Array<string> | null| undefined{ return this._informacoesContato; }
  public set informacoesContato(value: Array<string> | null| undefined){
    if(this._informacoesContato === value) return;
    this._informacoesContato = value;
  }
  private _internalId?: string | null;
  public get internalId(): string | null| undefined{ return this._internalId; }
  public set internalId(value: string | null| undefined){
    if(this._internalId === value) return;
    this._internalId = value;
  }
  private _lastModifiedAt?: string | null;
  public get lastModifiedAt(): string | null| undefined{ return this._lastModifiedAt; }
  public set lastModifiedAt(value: string | null| undefined){
    if(this._lastModifiedAt === value) return;
    this._lastModifiedAt = value;
  }
  private _lastModifiedBy?: {
} | null;
  public get lastModifiedBy(): {
} | null| undefined{ return this._lastModifiedBy; }
  public set lastModifiedBy(value: {
} | null| undefined){
    if(this._lastModifiedBy === value) return;
    this._lastModifiedBy = value;
  }

  /**
   * Nome
   */
  private _nome?: string | null;
  public get nome(): string | null| undefined{ return this._nome; }
  public set nome(value: string | null| undefined){
    if(this._nome === value) return;
    this._nome = value;
  }
  private _nomeFantasia?: string | null;
  public get nomeFantasia(): string | null| undefined{ return this._nomeFantasia; }
  public set nomeFantasia(value: string | null| undefined){
    if(this._nomeFantasia === value) return;
    this._nomeFantasia = value;
  }
  private _razaoSocial?: string | null;
  public get razaoSocial(): string | null| undefined{ return this._razaoSocial; }
  public set razaoSocial(value: string | null| undefined){
    if(this._razaoSocial === value) return;
    this._razaoSocial = value;
  }
  private _registroGeralRepublicaBrasileira?: string | null;
  public get registroGeralRepublicaBrasileira(): string | null| undefined{ return this._registroGeralRepublicaBrasileira; }
  public set registroGeralRepublicaBrasileira(value: string | null| undefined){
    if(this._registroGeralRepublicaBrasileira === value) return;
    this._registroGeralRepublicaBrasileira = value;
  }
  private _registroGeralRepublicaBrasileiraOrgaoEmissorOrgaoEmissor: string;
  public get registroGeralRepublicaBrasileiraOrgaoEmissorOrgaoEmissor(): string{ return this._registroGeralRepublicaBrasileiraOrgaoEmissorOrgaoEmissor; }
  public set registroGeralRepublicaBrasileiraOrgaoEmissorOrgaoEmissor(value: string){
    if(this._registroGeralRepublicaBrasileiraOrgaoEmissorOrgaoEmissor === value) return;
    this._registroGeralRepublicaBrasileiraOrgaoEmissorOrgaoEmissor = value;
  }
  private _site?: string | null;
  public get site(): string | null| undefined{ return this._site; }
  public set site(value: string | null| undefined){
    if(this._site === value) return;
    this._site = value;
  }

  /**
   * Sobrenome
   */
  private _sobrenome?: string | null;
  public get sobrenome(): string | null| undefined{ return this._sobrenome; }
  public set sobrenome(value: string | null| undefined){
    if(this._sobrenome === value) return;
    this._sobrenome = value;
  }
  private _tenants?: Array<string> | null;
  public get tenants(): Array<string> | null| undefined{ return this._tenants; }
  public set tenants(value: Array<string> | null| undefined){
    if(this._tenants === value) return;
    this._tenants = value;
  }
  private _tipoJuridico?: string | null;
  public get tipoJuridico(): string | null| undefined{ return this._tipoJuridico; }
  public set tipoJuridico(value: string | null| undefined){
    if(this._tipoJuridico === value) return;
    this._tipoJuridico = value;
  }
  toJSON(): IPessoa{
    return {
          createdAt:this._createdAt,
          createdBy:this._createdBy,
          documentos:this._documentos,
          emailPessoal:this._emailPessoal,
          empresa:this._empresa,
          endereco:this._endereco,
          informacoesContato:this._informacoesContato,
          internalId:this._internalId,
          lastModifiedAt:this._lastModifiedAt,
          lastModifiedBy:this._lastModifiedBy,
          nome:this._nome,
          nomeFantasia:this._nomeFantasia,
          razaoSocial:this._razaoSocial,
          registroGeralRepublicaBrasileira:this._registroGeralRepublicaBrasileira,
          registroGeralRepublicaBrasileiraOrgaoEmissorOrgaoEmissor:this._registroGeralRepublicaBrasileiraOrgaoEmissorOrgaoEmissor,
          site:this._site,
          sobrenome:this._sobrenome,
          tenants:this._tenants,
          tipoJuridico:this._tipoJuridico,
    }
  }
}
