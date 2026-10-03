Revise a implementação do Compositor. Adicione um menu de exportação, permitindo mais formatos de audio. E mais formatos de Master. 
Corrija a integração com os plugins,.
Adicione a opção de adicionar os metadados do audio como autoria, nome da musica entre outras informações pertinentes; 

```html 
<!-- music-composer.component.html -->
<div class="composer-container">
    <header>
        <h2>{{ master.projectName }}</h2>
        <div class="controls">
            <label>BPM:
                <input type="number" [(ngModel)]="master.bpm" [disabled]="isPlaying" />
            </label>
            <button mat-button (click)="togglePlayback()" [class.active]="isPlaying">
                {{ isPlaying ? 'Parar' : 'Tocar' }}
            </button>
        </div>
    </header>

    <div class="sequencer-grid">
        <div class="track" *ngFor="let track of master.tracks; let i = index">
            <div class="track-info">
                <span>{{ track.name }}</span>
            </div>
            <div class="steps">
                <button *ngFor="let step of track.steps; let j = index" class="step-btn" [class.active]="step"
                    [class.current]="isPlaying && currentStep === j" (click)="toggleStep(i, j)">
                </button>
            </div>
        </div>
    </div>
    <!-- NOVA SEÇÃO: Rack de Plugins -->
    <div class="plugins-rack">
        <h3>Rack de Efeitos e Plugins</h3>
        <div class="plugin-list">
            <label class="plugin-item" *ngFor="let p of availablePlugins">
                <input type="checkbox" [checked]="p.enabled" (change)="togglePlugin(p)" [disabled]="isPlaying">
                <!-- Bloqueia plugar/desplugar enquanto toca para evitar estalos -->
                {{ p.name }}
            </label>
        </div>
    </div>
    <footer class="export-actions">
        <button mat-button (click)="saveMaster()">
            <mat-icon>save</mat-icon>
            Salvar Master (Projeto)
        </button>
        <button mat-button (click)="exportAudio()" [disabled]="isRecording">
            <mat-icon>mic</mat-icon>{{ isRecording ? 'Gravando e Exportando...' : 'Exportar Áudio (.webm)' }}
        </button>
    </footer>
</div>
```


```scss

/* music-composer.component.scss */
.composer-container {
    padding: 20px;
    border-radius: 8px;
    font-family: monospace;
}

.controls {
    margin-bottom: 20px;
}

.controls button.active {
    background: #ff4757;
}

.track {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.track-info {
    width: 120px;
    font-size: 14px;
}

.steps {
    display: flex;
    gap: 4px;
}

.step-btn {
    width: 30px;
    height: 30px;
    border: 1px solid #444;
    cursor: pointer;
    border-radius: 4px;
}

.step-btn.active {
    background-color: #DEFF99;
}

/* Indicador visual de qual nota está tocando no momento */
.step-btn.current {
    border: 2px solid #fff;
    transform: scale(1.1);
}

.export-actions {
    margin-top: 30px;
    display: flex;
    gap: 15px;
}

.export-actions button {
    padding: 10px 15px;
    font-weight: bold;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.btn-master {
    color: white;
}

.btn-audio {
    color: white;
}

.plugins-rack {
    margin-top: 20px;
    padding: 15px;
    background: #2a2a2a;
    border-radius: 8px;
    border: 1px solid #444;
}

.plugins-rack h3 {
    margin-top: 0;
    font-size: 14px;
    color: #aaa;
    text-transform: uppercase;
}

.plugin-list {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

.plugin-item {
    background: #111;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.plugin-item input {
    cursor: pointer;
}
```


```ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DelayPlugin } from './delay.component';
import { ConsoleVisualizerPlugin } from './plugins/analyzer.plugin';
import { MetronomePlugin } from './metronome.plugin';
import { MusicPlugin } from './music-plugin.interface';

// music-models.ts
export interface Track {
  id: string;
  name: string;
  frequency: number; // Frequência da nota (ex: 440 para Lá)
  steps: boolean[];  // Array de 16 posições indicando onde a nota toca
}

export interface ProjectMaster {
  id?: string;
  projectName: string;
  bpm: number;
  tracks: Track[];
}


@Component({
  selector: 'ci-compositor',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './compositor.component.html',
  styleUrl: './compositor.component.scss',
})
export class CompositorComponent implements OnInit {
  audioContext!: AudioContext;
  masterBus!: GainNode; // Todas as notas tocam AQUI
  master: ProjectMaster = {
    projectName: 'Nova Composição Modular',
    bpm: 120,
    tracks: [
      { id: '1', name: 'Kick (Baixo)', frequency: 150, steps: new Array(16).fill(false) },
      { id: '2', name: 'Synth (Médio)', frequency: 440, steps: new Array(16).fill(false) },
      { id: '3', name: 'Lead (Alto)', frequency: 880, steps: new Array(16).fill(false) }
    ]
  };
  togglePlugin(pluginItem: any) {
    pluginItem.enabled = !pluginItem.enabled;

    if (pluginItem.enabled) {
      // 1. Inicializa o plugin passando o contexto de áudio
      pluginItem.instance.init(this.audioContext);
      // 2. Adiciona à lista de plugins que estão rodando
      this.activePlugins.push(pluginItem.instance);
    } else {
      // 1. Remove da lista de plugins ativos
      this.activePlugins = this.activePlugins.filter((p: any) => p !== pluginItem.instance);
      // 2. Chama a limpeza de memória, se o plugin possuir
      if (pluginItem.instance.destroy) pluginItem.instance.destroy();
    }

    // A MÁGICA ACONTECE AQUI: Refaz as conexões dos "cabos virtuais" de áudio
    this.rebuildAudioChain();
  }
  // Catálogo de plugins para aparecer na tela
  availablePlugins = [
    { id: 'delay', name: 'Efeito: Delay Espacial', instance: new DelayPlugin(), enabled: false },
    { id: 'metro', name: 'Instrumento: Metrônomo', instance: new MetronomePlugin(), enabled: false },
    { id: 'vis', name: 'Analisador de Volume', instance: new ConsoleVisualizerPlugin(), enabled: false }
  ];
  // 1. Propriedades de estado e gravação
  isRecording = false;
  mediaRecorder!: MediaRecorder;
  recordedChunks: Blob[] = [];
  destinationNode!: MediaStreamAudioDestinationNode;
  // 2. Método para interagir com a grade do sequenciador
  toggleStep(trackIndex: number, stepIndex: number) {
    this.master.tracks[trackIndex].steps[stepIndex] = !this.master.tracks[trackIndex].steps[stepIndex];
  }
  activePlugins: MusicPlugin[] = [];
  togglePlayback() {
    if (this.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }
  saveMaster() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.master, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${this.master.projectName}-master.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
  exportAudio() {
    this.recordedChunks = [];
    this.isRecording = true;
    this.mediaRecorder.start();

    this.startPlayback(); // Inicia a música para ser gravada

    // Calcula o tempo exato de 1 loop (16 passos)
    const loopDurationMs = ((60 / this.master.bpm) * 1000 / 4) * 16;

    setTimeout(() => {
      this.stopPlayback();
      this.mediaRecorder.stop();
      this.isRecording = false;
    }, loopDurationMs);
  }

  private downloadAudioFile() {
    const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = `${this.master.projectName}-bounce.webm`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  // Sequenciador
  isPlaying = false;
  currentStep = 0;
  bpm = 120;
  private timerId: any;

  ngOnInit() {
    this.audioContext = new AudioContext();
    this.masterBus = this.audioContext.createGain();

    // Registra os plugins
    this.registerPlugin(new DelayPlugin());
    this.registerPlugin(new ConsoleVisualizerPlugin());
    this.registerPlugin(new MetronomePlugin());

    this.rebuildAudioChain();
  }

  registerPlugin(plugin: MusicPlugin) {
    plugin.init(this.audioContext);
    this.activePlugins.push(plugin);
  }

  // Monta a corrente: MasterBus -> [Plugin 1] -> [Plugin 2] -> Saída
  rebuildAudioChain() {
    // Desconecta tudo primeiro para evitar correntes duplicadas
    this.masterBus.disconnect();

    let currentOutput: AudioNode = this.masterBus;

    const effectPlugins = this.activePlugins.filter(p => p.setupAudioChain);

    effectPlugins.forEach(plugin => {
      // Cria um nó intermediário para o plugin ligar sua saída
      const nextInput = this.audioContext.createGain();
      plugin.setupAudioChain!(currentOutput, nextInput);
      currentOutput = nextInput;
    });

    // O final da corrente liga nas caixas de som
    currentOutput.connect(this.audioContext.destination);
  }

  startPlayback() {
    this.isPlaying = true;
    const stepMs = (60 / this.bpm) * 1000 / 4;

    this.timerId = setInterval(() => {
      // 1. Toca as notas da track (conectando no masterBus)
      // (Lógica de reprodução da interface Track aqui...)
      // this.playNote(frequency, this.masterBus);

      // 2. Notifica os plugins do relógio
      this.activePlugins.forEach(plugin => {
        if (plugin.onStep) plugin.onStep(this.currentStep, this.bpm);
      });

      this.currentStep = (this.currentStep + 1) % 16;
    }, stepMs);
  }

  stopPlayback() {
    this.isPlaying = false;
    clearInterval(this.timerId);
    this.currentStep = 0;
  }
}
```

Retorne a implementação completa destes arquivos.
