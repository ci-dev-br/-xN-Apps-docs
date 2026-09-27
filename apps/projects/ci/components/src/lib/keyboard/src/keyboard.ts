import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TEXTOBASE } from '../../../../../../../src/app/texto_base';
import { ApiModule, KeyboardTheme, KeyboardThemesService, NewsService } from '@ci/portal-api';
interface AndroidBridge {
  onKey(character: string): void;
  onAction(action: string): void;
}
declare global {
  interface Window {
    AndroidKeyboard?: AndroidBridge;
  }
}
interface KeyboardKey {
  label: string;
  value?: string;
  type: 'char' | 'action' | 'modifier';
  action?: string;
  flex?: number;
}
// Texto Base em Português para o Teclado Dinâmico
const REFERENCE_TEXT = TEXTOBASE;
// Mapa de resolução de acentos
const ACCENT_MAP: Record<string, Record<string, string>> = {
  '´': { 'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú', 'A': 'Á', 'E': 'É', 'I': 'Í', 'O': 'Ó', 'U': 'Ú', 'c': 'ç', 'C': 'Ç' },
  '`': { 'a': 'à', 'e': 'è', 'i': 'ì', 'o': 'ò', 'u': 'ù', 'A': 'À', 'E': 'È', 'I': 'Ì', 'O': 'Ò', 'U': 'Ù' },
  '~': { 'a': 'ã', 'o': 'õ', 'n': 'ñ', 'A': 'Ã', 'O': 'Õ', 'N': 'Ñ' },
  '^': { 'a': 'â', 'e': 'ê', 'i': 'î', 'o': 'ô', 'u': 'û', 'A': 'Â', 'E': 'Ê', 'I': 'Î', 'O': 'Ô', 'U': 'Û' },
  '¨': { 'a': 'ä', 'e': 'ë', 'i': 'ï', 'o': 'ö', 'u': 'ü', 'A': 'Ä', 'E': 'Ë', 'I': 'Ï', 'O': 'Ö', 'U': 'Ü' }
};
// Definição dos layouts pré-configurados
const LAYOUT_PROGRAMMING: KeyboardKey[][] = [
  [
    { label: 'Esc', type: 'action', action: 'ESC', flex: 1.5 },
    { label: '{', type: 'char' }, { label: '}', type: 'char' },
    { label: '(', type: 'char' }, { label: ')', type: 'char' },
    { label: '<', type: 'char' }, { label: '>', type: 'char' },
    { label: '"', type: 'char' }, { label: "'", type: 'char' },
    { label: '_', type: 'char' },
    { label: '|', type: 'char' },
    { label: '?', type: 'char' },
    { label: '!', type: 'char' },
  ],
  [...['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='].map(k => ({ label: k, type: 'char' } as KeyboardKey))],
  [...['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '´', '['].map(k => ({ label: k, type: 'char' } as KeyboardKey))],
  [...['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç', '~', ']'].map(k => ({ label: k, type: 'char' } as KeyboardKey))],
  [
    { label: '⇧', type: 'modifier', action: 'SHIFT', flex: 1.5 },
    { label: '\\', type: 'char' },
    ...['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'].map(k => ({ label: k, type: 'char' } as KeyboardKey)),
    { label: '⌫', type: 'action', action: 'BACKSPACE', flex: 1.5 }
  ],
  [
    { label: 'Ctrl', type: 'modifier', action: 'CTRL', flex: 1.2 },
    { label: 'Tab', type: 'action', action: 'TAB', flex: 1.2 },
    { label: '@', type: 'char' },
    { label: 'Space', value: ' ', type: 'char', flex: 4 },
    { label: ';', type: 'char' },
    { label: '/', type: 'char' },
    { label: '↵', type: 'action', action: 'ENTER', flex: 1.5 }
  ]
];
const LAYOUT_TEXT: KeyboardKey[][] = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(k => ({ label: k, type: 'char' })),
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map(k => ({ label: k, type: 'char' })),
  [
    ...['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map(k => ({ label: k, type: 'char' } as KeyboardKey)),
    { label: '⌫', type: 'action', action: 'BACKSPACE', flex: 1.5 }
  ],
  [
    { label: '⇧', type: 'modifier', action: 'SHIFT', flex: 1.5 },
    ...['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(k => ({ label: k, type: 'char' } as KeyboardKey)),
    { label: '↵', type: 'action', action: 'ENTER', flex: 1.5 }
  ],
  [
    { label: '?', type: 'char' }, { label: '!', type: 'char' },
    { label: ',', type: 'char' },
    { label: 'Space', value: ' ', type: 'char', flex: 4 },
    { label: '.', type: 'char' }, { label: '-', type: 'char' }
  ]
];
const LAYOUT_SOCIAL: KeyboardKey[][] = [
  ['@', '#', '😂', '❤️', '👍', '🔥', '✨', '🎉'].map(k => ({ label: k, type: 'char' })),
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map(k => ({ label: k, type: 'char' })),
  [
    ...['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map(k => ({ label: k, type: 'char' } as KeyboardKey)),
    { label: '⌫', type: 'action', action: 'BACKSPACE', flex: 1.5 }
  ],
  [
    { label: '⇧', type: 'modifier', action: 'SHIFT', flex: 1.5 },
    ...['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(k => ({ label: k, type: 'char' } as KeyboardKey)),
    { label: '↵', type: 'action', action: 'ENTER', flex: 1.5 }
  ],
  [
    { label: '_', type: 'char' }, { label: '&', type: 'char' },
    { label: 'Space', value: ' ', type: 'char', flex: 5 },
    { label: '.', type: 'char' }, { label: '?', type: 'char' }
  ]
];
const LAYOUT_PINPAD: KeyboardKey[][] = [
  ['1', '2', '3'].map(k => ({ label: k, type: 'char' })),
  ['4', '5', '6'].map(k => ({ label: k, type: 'char' })),
  ['7', '8', '9'].map(k => ({ label: k, type: 'char' })),
  ['BACKSPACE', '8', 'ENTER'].map(k => ({ label: k, type: 'action' })),
];

const LAYOUT_GAME: KeyboardKey[][] = [
  [
    { label: 'Esc', type: 'action', action: 'ESC' },
    ...['1', '2', '3', '4', '5'].map(k => ({ label: k, type: 'char' } as KeyboardKey)),
    { label: 'M', type: 'char' }, { label: 'I', type: 'char' }
  ],
  [
    { label: 'Tab', type: 'action', action: 'TAB', flex: 1.5 },
    ...['Q', 'W', 'E', 'R', 'T', 'Y'].map(k => ({ label: k, value: k.toLowerCase(), type: 'char' } as KeyboardKey))
  ],
  [
    { label: '⇧', type: 'modifier', action: 'SHIFT', flex: 1.5 },
    ...['A', 'S', 'D', 'F', 'G', 'H'].map(k => ({ label: k, value: k.toLowerCase(), type: 'char' } as KeyboardKey))
  ],
  [
    { label: 'Ctrl', type: 'modifier', action: 'CTRL', flex: 1.5 },
    ...['Z', 'X', 'C', 'V', 'B'].map(k => ({ label: k, value: k.toLowerCase(), type: 'char' } as KeyboardKey)),
    { label: 'Space', value: ' ', type: 'char', flex: 3 }
  ]
];
@Component({
  selector: 'app-keyboard',
  standalone: true,
  imports: [
    CommonModule,
    ApiModule,
  ],
  template: `
    <div class="keyboard-wrapper" [ngStyle]="getDynamicStyles()">
      
     <!-- Teclado Principal -->
      <div class="keyboard-container">
        @for (row of layout; track $index) {
          <div class="row">
            @for (key of row; track key.label) {
              <button 
                [class]="key.type"
                [class.active]="isModifierActive(key.action)"
                [class.pending-accent]="isAccentPending(key)"
                [class.hidden-key]="!isKeyVisible(key) && dynamicLayoutMode === 'hidden'"
                [class.collapsed-key]="!isKeyVisible(key) && dynamicLayoutMode === 'collapse'"
                [style.flex]="key.flex || 1"
                (click)="handleKey(key)">
                {{ getLabel(key) }}
              </button>
            }
          </div>
        }
      </div>
      
      <!-- Botões Inferiores -->
      <div class="bottom-bar" style="padding-left: 10px">
        <button class="menu-toggle-btn" (click)="auto()">
          Auto
        </button>
        <button class="menu-toggle-btn" (click)="toggleMenu()">
          ⚙️ 
        </button>
        
        <!-- Botões exclusivos para o layout dinâmico -->
        @if (currentLayoutName === 'dynamic') {
          <button class="menu-toggle-btn secondary-btn" (click)="forceShowAllKeys = !forceShowAllKeys">
            {{ forceShowAllKeys ? '🎯 Filtrar' : '👁️ Tudo' }}
          </button>
          
          <button class="menu-toggle-btn tertiary-btn" (click)="toggleDynamicMode()">
            {{ dynamicLayoutMode === 'hidden' ? 'Esticar' : 'Preservar Posição' }}
          </button>
        }
      </div>
      <!-- Overlay do Menu -->
      <div class="menu-overlay" *ngIf="isMenuOpen">
        <div class="menu-content">
          <div class="menu-header">
            <h3>Configurações</h3>
            <button class="close-btn" (click)="toggleMenu()">✕</button>
          </div>
          
          <div class="menu-tabs">
            <button [class.active]="activeMenuTab === 'themes'" (click)="activeMenuTab = 'themes'">Temas</button>
            <button [class.active]="activeMenuTab === 'layouts'" (click)="activeMenuTab = 'layouts'">Layouts</button>
            <button [class.active]="activeMenuTab === 'custom'" (click)="activeMenuTab = 'custom'">Custom</button>
          </div>
          <!-- Aba Temas (AGORA DINÂMICA) -->
          <div class="tab-content" *ngIf="activeMenuTab === 'themes'">
            <div class="options-grid">
              @if (themesFromApi && themesFromApi.length > 0) {
                <!-- Renderiza os temas que vieram do Postgresql via NestJS -->
                @for (theme of themesFromApi; track theme.name) {
                  <button (click)="setTheme(theme.name)" [class.selected]="currentTheme === theme.name">
                    {{ theme.displayName }}
                  </button>
                }
              } @else {
                <p style="color: #888; text-align: center; font-size: 0.9rem;">Carregando temas...</p>
              }
            </div>
          </div>
          <!-- Aba Layouts -->
          <div class="tab-content" *ngIf="activeMenuTab === 'layouts'">
            <div class="options-grid">
              <button (click)="setLayout('dynamic')" [class.selected]="currentLayoutName === 'dynamic'">⚡ Dinâmico (Inteligente)</button>
              <button (click)="setLayout('programming')" [class.selected]="currentLayoutName === 'programming'">Programação</button>
              <button (click)="setLayout('pinpad')" [class.selected]="currentLayoutName === 'pinpad'">Pinpad</button>
              <button (click)="setLayout('text')" [class.selected]="currentLayoutName === 'text'">Texto</button>
              <button (click)="setLayout('social')" [class.selected]="currentLayoutName === 'social'">Redes Sociais</button>
              <button (click)="setLayout('game')" [class.selected]="currentLayoutName === 'game'">Jogos</button>
              
              <div class="divider" *ngIf="customLayoutsNames.length > 0">Meus Layouts</div>
              
              @for (custom of customLayoutsNames; track custom) {
                  <button (click)="setLayout(custom)" [class.selected]="currentLayoutName === custom">
                      {{ custom }}
                  </button>
              }
            </div>
          </div>
          <!-- Aba Criar Custom -->
          <div class="tab-content" *ngIf="activeMenuTab === 'custom'">
            <div class="form-group">
                <label>Nome do Layout:</label>
                <input type="text" #layoutName placeholder="Ex: Meu Teclado" class="input-text">
            </div>
            <div class="form-group">
                <label>Teclas (Separe por espaço, quebre linha para nova linha):</label>
                <textarea #layoutData placeholder="q w e r t y&#10;a s d f g h&#10;z x c v b n" rows="5" class="input-text"></textarea>
                <small>Use SHIFT, ENTER, BACKSPACE, SPACE, TAB, CTRL, ESC para teclas especiais.</small>
            </div>
            <button class="save-btn" (click)="saveCustomLayout(layoutName.value, layoutData.value)">Salvar Layout</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep body { margin: 0; background-color: black; overflow: hidden; }
    
    .keyboard-wrapper {
      /* Valores padrão de fallback caso a API demore a carregar ou o tema não exista */
      --bg: #1e1e1e;
      --key-bg: #333;
      --key-color: #fff;
      --key-radius: 6px;
      --key-action-bg: #2d4558;
      --key-action-color: #fff;
      --key-mod-bg: #444;
      --key-mod-color: #fff;
      --key-shadow: 0 4px 0 rgba(0,0,0,0.2);
      --font-family: monospace;
      --key-gap: 0px;
      
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: var(--bg);
      font-family: var(--font-family);
      position: relative;
    }
    /* As classes fixas de tema (.theme-farm, .theme-ios, etc) foram removidas pois os estilos vêm da API via [ngStyle] */
    .keyboard-container { 
      display: flex; flex-direction: column; gap: var(--key-gap); padding: 10px; flex-grow: 1;
      touch-action: manipulation; user-select: none; justify-content: stretch; align-items: stretch;
    }
    .row { display: flex; justify-content: center; gap: var(--key-gap); width: 100%; flex-grow: 1; }
    button { 
      padding: 0px; font-size: 1.1rem; border-radius: var(--key-radius); border: none; 
      background: var(--key-bg); color: var(--key-color); box-shadow: var(--key-shadow);
      display: flex; align-items: center; justify-content: center; cursor: pointer; 
      transition: all 0.1s; font-family: inherit;
    }
    button:active { transform: translateY(2px) scale(0.95); box-shadow: none; opacity: 0.8; }
    button.action { background: var(--key-action-bg); color: var(--key-action-color); font-weight: bold; }
    button.modifier { background: var(--key-mod-bg); color: var(--key-mod-color); }
    button.active { background: #007acc !important; color: white !important; box-shadow: 0 0 10px #007acc; }
    
    /* Modos de Ocultação do Layout Dinâmico */
    button.hidden-key { visibility: hidden; pointer-events: none; }
    button.collapsed-key { display: none !important; }
    button.pending-accent {
      background: #e6a23c !important;
      color: #000 !important;
      box-shadow: 0 0 8px #e6a23c;
      transform: scale(0.95);
    }
    .bottom-bar { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; padding: 10px; background: rgba(0,0,0,0.3); }
    .menu-toggle-btn { background: transparent; color: var(--key-color); border: 1px solid var(--key-color); padding: 8px 14px; border-radius: 20px; font-size: 0.85rem; flex: 0 1 auto; box-shadow: none; }
    .secondary-btn { border-color: #007acc; color: #66b3ff; }
    .tertiary-btn { border-color: #e6a23c; color: #e6a23c; }
    .menu-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); display: flex; flex-direction: column; z-index: 100; font-family: sans-serif; padding: 20px; color: white; justify-content: flex-end; }
    .menu-content { background: #2a2a2a; border-radius: 12px; display: flex; flex-direction: column; max-height: 90%; overflow: hidden; box-shadow: 0 -5px 20px rgba(0,0,0,0.5); }
    .menu-header { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #444; }
    .menu-header h3 { margin: 0; font-size: 1.1rem; }
    .close-btn { background: transparent; box-shadow: none; width: 30px; height: 30px; }
    
    .menu-tabs { display: flex; background: #1e1e1e; }
    .menu-tabs button { flex: 1; padding: 12px; border-radius: 0; background: transparent; box-shadow: none; color: #aaa; font-size: 0.9rem; border-bottom: 2px solid transparent; }
    .menu-tabs button.active { color: #fff; border-bottom-color: #007acc; }
    .tab-content { padding: 15px; overflow-y: auto; }
    .options-grid { display: flex; flex-direction: column; gap: 0px; }
    .options-grid button { padding: 12px; background: #333; border-radius: 8px; box-shadow: none; justify-content: flex-start; }
    .options-grid button.selected { background: #007acc; border-left: 4px solid white; }
    .divider { margin: 15px 0 5px 0; color: #888; font-size: 0.8rem; text-transform: uppercase; }
    .form-group { display: flex; flex-direction: column; gap: 0px; margin-bottom: 15px; }
    .form-group label { font-size: 0.9rem; color: #ccc; }
    .form-group small { font-size: 0.75rem; color: #888; }
    .input-text { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #444; background: #111; color: white; font-family: monospace; box-sizing: border-box; }
    .save-btn { background: #28a745; width: 100%; padding: 12px; margin-top: 10px; }
  `]
})
export class KeyboardComponent implements OnInit {
  shiftActive = false;
  ctrlActive = false;
  pendingAccent: string | null = null;
  isMenuOpen = false;
  activeMenuTab: 'themes' | 'layouts' | 'custom' = 'themes';
  currentTheme = 'theme-default';
  currentLayoutName = 'dynamic';
  layout: KeyboardKey[][] = LAYOUT_PROGRAMMING;
  // Estados para o Teclado Dinâmico
  dynamicTypedSequence: string = '';
  forceShowAllKeys: boolean = false;
  dynamicLayoutMode: 'hidden' | 'collapse' = 'hidden';
  customLayouts: Record<string, KeyboardKey[][]> = {};
  customLayoutsNames: string[] = [];
  themesFromApi?: KeyboardTheme[];
  constructor(
    private readonly keyboardThemes: KeyboardThemesService,
    private readonly news: NewsService,
  ) { }
  ngOnInit() {
    this.loadCustomLayouts();
    this.loadPreferences();
    this.keyboardThemes.keyboardThemesControllerFindAll({}).subscribe((r => this.themesFromApi = r));
  }
  auto() {
    this.news.getFeed({
      offset: Math.floor(Math.random() * 10000),
      dataFinal: new Date().toISOString(),
      dataInicial: new Date('2026-05-05').toISOString()
    }).subscribe(async r => {
      const n = r[0];
      let t = n.title;
      setTimeout(() => {
        this.sendKey(
          n.title.substring(0, 40 + Math.floor(Math.random() * 60)
          ));
        this.sendAction('ENTER');
        setTimeout(() => {
          setTimeout(() => {
            this.sendAction('ENTER');
            this.auto();
          }, 20000);
        }, 100);
      }, 100);
    })
  }
  loadPreferences() {
    try {
      const prefsStr = localStorage.getItem('angular_keyboard_prefs');
      if (prefsStr) {
        const prefs = JSON.parse(prefsStr);
        if (prefs.theme) this.currentTheme = prefs.theme;
        if (prefs.dynamicLayoutMode) this.dynamicLayoutMode = prefs.dynamicLayoutMode;
        if (prefs.layoutName) this.setLayout(prefs.layoutName, false);
      } else {
        this.setLayout('dynamic', false);
      }
    } catch (e) {
      console.error('Erro ao ler preferências do teclado', e);
    }
  }
  savePreferences() {
    try {
      const prefs = {
        theme: this.currentTheme,
        layoutName: this.currentLayoutName,
        dynamicLayoutMode: this.dynamicLayoutMode
      };
      localStorage.setItem('angular_keyboard_prefs', JSON.stringify(prefs));
    } catch (e) { }
  }
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  toggleDynamicMode() {
    this.dynamicLayoutMode = this.dynamicLayoutMode === 'hidden' ? 'collapse' : 'hidden';
    this.savePreferences();
  }
  setTheme(theme: string) {
    this.currentTheme = theme;
    this.savePreferences();
  }
  setLayout(layoutName: string, savePref: boolean = true) {
    this.currentLayoutName = layoutName;
    // Reseta o estado dinâmico se trocar de layout
    this.dynamicTypedSequence = '';
    this.forceShowAllKeys = false;
    switch (layoutName) {
      case 'dynamic':
      case 'programming': this.layout = LAYOUT_PROGRAMMING; break;
      case 'text': this.layout = LAYOUT_TEXT; break;
      case 'social': this.layout = LAYOUT_SOCIAL; break;
      case 'pinpad': this.layout = LAYOUT_PINPAD; break;
      case 'game': this.layout = LAYOUT_GAME; break;
      default:
        if (this.customLayouts[layoutName]) {
          this.layout = this.customLayouts[layoutName];
        }
        break;
    }
    if (savePref) this.savePreferences();
  }
  // --- Lógica do Teclado Dinâmico ---
  isKeyVisible(key: KeyboardKey): boolean {
    if (this.currentLayoutName !== 'dynamic') return true;
    if (this.forceShowAllKeys) return true;
    // Controles, Modificadores e Espaço sempre visíveis
    if (key.type === 'action' || key.type === 'modifier') return true;
    if (key.label === 'Space' || key.value === ' ' || key.action === 'ENTER') return true;
    const char = (key.value !== undefined ? key.value : key.label);
    const normChar = this.normalize(char);
    // Lógica do acento pendente
    if (this.pendingAccent) {
      const charToTest = (this.shiftActive && char.length === 1 && /[a-zç]/.test(char))
        ? char.toUpperCase()
        : char;
      return !!ACCENT_MAP[this.pendingAccent][charToTest];
    }
    // Mantém pontuações e símbolos livres
    if (!/^[a-zç0-9]$/i.test(normChar)) return true;
    if (!this.dynamicTypedSequence) return true;
    const availableChars = this.getAvailableNextChars();
    if (availableChars.size === 0) return true;
    return availableChars.has(normChar);
  }
  getAvailableNextChars(): Set<string> {
    const allowed = new Set<string>();
    if (!this.dynamicTypedSequence) return allowed;
    const normSequence = this.normalize(this.dynamicTypedSequence);
    const refText = this.normalize(REFERENCE_TEXT);
    // 1. TENTA BUSCAR NO TEXTO DE REFERÊNCIA (Max Trigrama)
    let sequence = normSequence.slice(-1);
    while (sequence.length > 0) {
      let startIndex = 0;
      let index;
      while ((index = refText.indexOf(sequence, startIndex)) > -1) {
        const nextCharIndex = index + sequence.length;
        if (nextCharIndex < refText.length) {
          allowed.add(refText[nextCharIndex]);
        }
        startIndex = index + 1;
      }
      if (allowed.size >= 4) return allowed;
      sequence = sequence.slice(1);
    }
    // 2. MOTOR FONOTÁTICO (Fallback de Regras do Português)
    const lastChar = normSequence.slice(-1);
    const vowels = 'aeiou';
    if (lastChar === 'q') allowed.add('u');
    else if (lastChar === 'ç') ['a', 'o', 'u'].forEach(c => allowed.add(c));
    else if (lastChar === 'm') ['a', 'e', 'i', 'o', 'u', 'p', 'b'].forEach(c => allowed.add(c));
    else if (['b', 'c', 'd', 'f', 'g', 'p', 't', 'v'].includes(lastChar)) {
      let options = vowels + 'rls';
      if (lastChar === 'c') options += 'hç';
      options.split('').forEach(c => allowed.add(c));
    }
    else {
      return new Set();
    }
    return allowed;
  }
  private normalize(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  // --- Sistema de Layouts Customizados ---
  loadCustomLayouts() {
    try {
      const saved = localStorage.getItem('angular_custom_keyboards');
      if (saved) {
        this.customLayouts = JSON.parse(saved);
        this.customLayoutsNames = Object.keys(this.customLayouts);
      }
    } catch (e) { }
  }
  saveCustomLayout(name: string, rawData: string) {
    if (!name.trim() || !rawData.trim()) { alert('Preencha os dados.'); return; }
    const parsedLayout: KeyboardKey[][] = rawData.split('\n').map(row => {
      return row.trim().split(/\s+/).filter(char => char).map(char => {
        if (char.toUpperCase() === 'SPACE') return { label: 'Space', value: ' ', type: 'char', flex: 3 };
        if (char.toUpperCase() === 'BACKSPACE') return { label: '⌫', type: 'action', action: 'BACKSPACE', flex: 1.5 };
        if (char.toUpperCase() === 'ENTER') return { label: '↵', type: 'action', action: 'ENTER', flex: 1.5 };
        if (char.toUpperCase() === 'SHIFT') return { label: '⇧', type: 'modifier', action: 'SHIFT', flex: 1.5 };
        if (char.toUpperCase() === 'TAB') return { label: 'Tab', type: 'action', action: 'TAB', flex: 1.2 };
        if (char.toUpperCase() === 'CTRL') return { label: 'Ctrl', type: 'modifier', action: 'CTRL', flex: 1.2 };
        if (char.toUpperCase() === 'ESC') return { label: 'Esc', type: 'action', action: 'ESC', flex: 1.5 };
        return { label: char, type: 'char' };
      });
    });
    this.customLayouts[name] = parsedLayout;
    this.customLayoutsNames = Object.keys(this.customLayouts);
    localStorage.setItem('angular_custom_keyboards', JSON.stringify(this.customLayouts));
    this.setLayout(name);
    this.activeMenuTab = 'layouts';
  }
  // --- Lógica de Digitação ---
  getLabel(key: KeyboardKey): string {
    let label = key.label;
    if (this.shiftActive && key.type === 'char') {
      if (label.length === 1 && /[a-zç]/.test(label)) return label.toUpperCase();
      if (label === '´') return '\`';
      if (label === '~') return '^';
    }
    return label;
  }
  isModifierActive(action?: string): boolean {
    if (action === 'SHIFT') return this.shiftActive;
    if (action === 'CTRL') return this.ctrlActive;
    return false;
  }
  isAccentPending(key: KeyboardKey): boolean {
    if (!this.pendingAccent) return false;
    return this.getLabel(key) === this.pendingAccent;
  }
  // Typescript do Angular
  getDynamicStyles() {
    // Retorna vazio caso os temas não tenham carregado ainda, ativando as variáveis de fallback no CSS
    const activeTheme = this.themesFromApi?.find(t => t.name === this.currentTheme);
    if (!activeTheme) return {};
    return {
      '--bg': activeTheme.bg,
      '--key-bg': activeTheme.keyBg,
      '--key-color': activeTheme.keyColor,
      '--key-radius': activeTheme.keyRadius,
      '--key-action-bg': activeTheme.keyActionBg,
      '--key-action-color': activeTheme.keyActionColor,
      '--key-mod-bg': activeTheme.keyModBg,
      '--key-mod-color': activeTheme.keyModColor,
      '--key-shadow': activeTheme.keyShadow,
      '--font-family': activeTheme.fontFamily,
      '--key-gap': activeTheme.keyGap
    };
  }
  handleKey(key: KeyboardKey) {
    if (key.type === 'modifier') {
      if (key.action === 'SHIFT') this.shiftActive = !this.shiftActive;
      if (key.action === 'CTRL') this.ctrlActive = !this.ctrlActive;
      return;
    }
    if (key.type === 'action') {
      if (key.action === 'BACKSPACE') {
        if (this.pendingAccent) {
          this.pendingAccent = null;
          return;
        }
        if (this.currentLayoutName === 'dynamic' && this.dynamicTypedSequence.length > 0) {
          this.dynamicTypedSequence = this.dynamicTypedSequence.slice(0, -1);
        }
      } else if (key.action === 'ENTER' && this.currentLayoutName === 'dynamic') {
        this.dynamicTypedSequence = '';
      }
      this.sendAction(key.action!);
      this.forceShowAllKeys = false;
      return;
    }
    let charToSend = key.value !== undefined ? key.value : key.label;
    if (this.shiftActive) {
      if (charToSend.length === 1 && /[a-zç]/.test(charToSend)) {
        charToSend = charToSend.toUpperCase();
      } else if (charToSend === '´') charToSend = '`';
      else if (charToSend === '~') charToSend = '^';
      this.shiftActive = false;
    }
    const isAccentKey = Object.keys(ACCENT_MAP).includes(charToSend);
    if (isAccentKey) {
      if (this.pendingAccent) {
        this.recordDynamicCharAndSend(this.pendingAccent);
      }
      this.pendingAccent = charToSend;
      return;
    }
    if (this.pendingAccent) {
      const combinedMap = ACCENT_MAP[this.pendingAccent];
      if (combinedMap && combinedMap[charToSend]) {
        charToSend = combinedMap[charToSend];
      } else if (charToSend === ' ') {
        charToSend = this.pendingAccent;
      } else {
        this.recordDynamicCharAndSend(this.pendingAccent);
      }
      this.pendingAccent = null;
    }
    this.recordDynamicCharAndSend(charToSend);
    this.forceShowAllKeys = false;
  }
  private recordDynamicCharAndSend(char: string) {
    if (this.currentLayoutName === 'dynamic') {
      if (char === ' ' || char === '\n') {
        this.dynamicTypedSequence = '';
      } else {
        this.dynamicTypedSequence += char;
      }
    }
    this.sendKey(char);
  }
  private sendKey(character: string) {
    if (window.AndroidKeyboard) {
      window.AndroidKeyboard.onKey(character);
    } else {
      console.log(`[Web Debug] Tecla: ${character}`);
    }
  }
  private sendAction(action: string) {
    if (window.AndroidKeyboard) {
      window.AndroidKeyboard.onAction(action);
    } else {
      console.log(`[Web Debug] Ação: ${action}`);
    }
  }
}