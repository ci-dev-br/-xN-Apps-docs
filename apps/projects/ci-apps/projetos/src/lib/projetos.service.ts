import { Component, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WindowService } from '@ci/components/window';
import { CoreModule } from '@ci/core';

@Component({
  selector: 'ci-projeto',
  standalone: true,
  template: `
  <style>
        :root {
            --primary-color: #2563eb;
            --bg-color: #f8fafc;
            --text-color: #1e293b;
            --border-color: #e2e8f0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        h2 {
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 10px;
            margin-bottom: 25px;
            color: var(--primary-color);
        }

        h3 {
            width: 100%;
            font-size: 1.1rem;
            margin-top: 20px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Flexbox Layout */
        .form-group-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            flex: 1 1 300px; /* Cresce, encolhe e tem base de 300px */
        }

        .form-group.full-width {
            flex: 1 1 100%;
        }

        label {
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 0.9rem;
        }

        input, select, textarea {
            padding: 10px;
            border: 1px solid var(--border-color);
            border-radius: 5px;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.3s;
        }

        input:focus, select:focus, textarea:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        textarea {
            resize: vertical;
            min-height: 80px;
        }

        .footer-actions {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
            gap: 15px;
        }

        .btn {
            padding: 12px 25px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: opacity 0.3s;
        }

        .btn-save { background-color: var(--primary-color); color: white; }
        .btn-cancel { background-color: #ef4444; color: white; }
        .btn:hover { opacity: 0.9; }

        @media (max-width: 600px) {
            .form-group { flex: 1 1 100%; }
        }
    </style>

<div class="container">
    <h2>Novo Projeto</h2>
    
    <form action="#">
        <h3>1. Identificação Básica</h3>
        <div class="form-group-container">
            <div class="form-group">
                <label for="projeto-nome">Nome do Projeto*</label>
                <input type="text" id="projeto-nome" placeholder="Ex: Expansão Logística" required>
            </div>
            <div class="form-group">
                <label for="cliente">Cliente</label>
                <select id="cliente">
                    <option value="">Selecione o cliente</option>
                    <option value="interno">Interno</option>
                    <option value="externo">Externo (Corporativo)</option>
                </select>
            </div>
            <div class="form-group">
                <label for="gerente">Gerente do Projeto</label>
                <input type="text" id="gerente" placeholder="Nome do PM">
            </div>
        </div>

        <h3>2. Prazos e Orçamento</h3>
        <div class="form-group-container">
            <div class="form-group">
                <label for="data-inicio">Data de Início</label>
                <input type="date" id="data-inicio">
            </div>
            <div class="form-group">
                <label for="data-fim">Previsão de Término</label>
                <input type="date" id="data-fim">
            </div>
            <div class="form-group">
                <label for="orcamento">Orçamento Estimado (R$)</label>
                <input type="number" id="orcamento" step="0.01" placeholder="0,00">
            </div>
        </div>

        <h3>3. Escopo e Detalhes</h3>
        <div class="form-group-container">
            <div class="form-group full-width">
                <label for="objetivo">Objetivo Estratégico</label>
                <input type="text" id="objetivo" placeholder="Resuma o propósito do projeto">
            </div>
            <div class="form-group full-width">
                <label for="descricao">Descrição Detalhada</label>
                <textarea id="descricao" placeholder="Descreva os detalhes técnicos e entregáveis"></textarea>
            </div>
            <div class="form-group">
                <label for="prioridade">Prioridade</label>
                <select id="prioridade">
                    <option value="baixa">Baixa</option>
                    <option value="media" selected>Média</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                </select>
            </div>
            <div class="form-group">
                <label for="anexo">Anexar Briefing/Escopo</label>
                <input type="file" id="anexo">
            </div>
        </div>

        <div class="footer-actions">
            <button type="button" class="btn btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-save">Cadastrar Projeto</button>
        </div>
    </form>
</div>
  `,
  imports: [
    CoreModule,
  ]
})
export class EditarProjetoComponent { }

@Injectable({
  providedIn: 'root'
})
export class ProjetosService {
  constructor(
    private readonly router: Router,
    private readonly window: WindowService,
  ) {
  }
  async CriarNovoProjeto() {
    this.window.open(EditarProjetoComponent, {})
  }
}
