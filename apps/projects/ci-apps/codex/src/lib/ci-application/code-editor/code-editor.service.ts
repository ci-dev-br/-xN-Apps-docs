import { Injectable } from '@angular/core';
import { FileDto, FileExplorerService } from '@ci/portal-api';

/**
 * Gerenciamento de arquivos abertos e edição
 * Controla o estado dos arquivos em edição
 * 
 * Estágio: Definição
 */
@Injectable()
export class CodeEditorService {
    constructor() { }
    arquivos?: FileDto[];
    
}