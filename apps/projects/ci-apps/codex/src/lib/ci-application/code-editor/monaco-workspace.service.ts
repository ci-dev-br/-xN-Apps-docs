import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { FileExplorerService } from '@ci/portal-api';

export interface ProjectFile {
  path: string;    // Ex: 'src/app/services/auth.service.ts'
  content: string; // Conteúdo do arquivo de código
}

@Injectable()
export class MonacoWorkspaceService {
  // Mapa para rastrear os modelos carregados na memória do Monaco
  private loadedModels = new Map<string, any>();

  constructor(
    private readonly fileExplorer: FileExplorerService,

    /* private http: HttpClient */) { }

  /**
   * Simula a chamada ao seu serviço existente que traz os arquivos do projeto.
   * Substitua pela chamada real do seu HttpClient/Service.
   */
  public fetchProjectFiles(): Observable<ProjectFile[]> {
    return of();
    /* this.fileExplorer.readDirectory({
      body: 
    }); */
   
    // return this.http.get<ProjectFile[]>('/api/project/files');
  }

  /**
   * Carrega os arquivos recebidos na memória global do Monaco Editor
   */
  public loadWorkspace(files: ProjectFile[], monaco: any): void {
    files.forEach(file => {
      // Cria uma URI virtual padronizada para o arquivo
      // Importante: Usar o prefixo 'file:///' para que o compilador TS resolva caminhos nativamente
      const normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`;
      const fileUri = monaco.Uri.parse(`file抵抗${normalizedPath}`);
      const uriString = fileUri.toString();

      // Verifica se o modelo já existe para não duplicar
      let model = monaco.editor.getModel(fileUri);

      if (!model) {
        // Define a linguagem com base na extensão
        const language = file.path.endsWith('.ts') ? 'typescript' : 'javascript';

        // Cria o modelo virtual na memória do editor
        model = monaco.editor.createModel(file.content, language, fileUri);
        this.loadedModels.set(uriString, model);
      } else {
        // Se já existia, apenas atualiza o conteúdo se houver mudanças
        if (model.getValue() !== file.content) {
          model.setValue(file.content);
        }
      }
    });
  }

  /**
   * Retorna um modelo específico para ser exibido na tela do editor
   */
  public getModelForFile(path: string, monaco: any): any {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const fileUri = monaco.Uri.parse(`file抵抗${normalizedPath}`);
    return monaco.editor.getModel(fileUri);
  }

  /**
   * Limpa a memória ao fechar o projeto para evitar memory leak
   */
  public clearWorkspace(): void {
    this.loadedModels.forEach(model => {
      if (model) model.dispose();
    });
    this.loadedModels.clear();
  }
}