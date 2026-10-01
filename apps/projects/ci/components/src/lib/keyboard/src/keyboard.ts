import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TEXTOBASE } from '../../../../../../../src/app/texto_base';
import { ApiModule, KeyboardTheme, KeyboardThemesService, NewsService } from '@ci/portal-api';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: 'keyboard.html',
  styleUrls: ['keyboard.scss']
})
export class KeyboardComponent implements OnInit {
  extras = [
    { label: 'Auto', icon: 'automation', act: () => this.auto() },
    { label: 'Run', icon: 'settings', act: () => this.toggleMenu() },
  ];
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