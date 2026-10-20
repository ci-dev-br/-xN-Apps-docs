import { Component, ElementRef, Input, OnInit, OnDestroy, ViewChild, Optional } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { STANDARD_MODULES, IModuleItem } from './dyn-input-modules.component';

@Component({
  selector: 'ci-dyn-input-chips-autocomplete',
  standalone: false,
  templateUrl: './dyn-input-chips-autocomplete.component.html',
  styleUrls: ['./dyn-input-chips-autocomplete.component.scss']
})
export class DynInputChipsAutocompleteComponent implements OnInit, OnDestroy {
  @Input() fieldName?: string = 'modules';
  @Input() label?: string = 'Módulos Integrados';
  @Input() description?: string = 'Selecione os módulos com auto-complete e organize via chips.';
  @Input() placeholder?: string = 'Digite ou selecione um módulo...';
  @Input() parentFormGroup?: FormGroup;
  @Input() parentFormControl?: FormControl;

  @Input() set formGroup(val: FormGroup | undefined) {
    this.parentFormGroup = val;
  }
  get formGroup(): FormGroup | undefined {
    return this.parentFormGroup;
  }

  @Input() set formControl(val: FormControl | undefined) {
    this.parentFormControl = val;
  }
  get formControl(): FormControl | undefined {
    return this.parentFormControl;
  }
  @Input() enumOptions?: string[];

  @ViewChild('moduleInput') moduleInput?: ElementRef<HTMLInputElement>;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  // Controle de input para o auto-complete
  inputCtrl = new FormControl('');
  filteredOptions$!: Observable<IModuleItem[]>;

  // Módulos selecionados (mat-chips)
  selectedModules: string[] = [];

  // Módulos disponíveis (padrões do catálogo ou enum do schema)
  availableModules: IModuleItem[] = [];

  // Alternador de visão (chips compacto vs pipeline detalhado)
  showDetailedPipeline: boolean = false;

  private controlSub?: Subscription;

  constructor() {}

  ngOnInit(): void {
    // 1. Inicializa catálogo de módulos disponíveis a partir do enum do @ApiProperty ou da lista padrão
    if (this.enumOptions && this.enumOptions.length > 0) {
      this.availableModules = this.enumOptions.map(opt => {
        const found = STANDARD_MODULES.find(m => m.key.toLowerCase() === opt.toLowerCase() || m.name.toLowerCase() === opt.toLowerCase());
        return found || {
          key: opt,
          name: opt,
          category: 'Módulo',
          icon: 'widgets',
          shortDescription: `Módulo padrão ${opt}`,
          isStandard: true
        };
      });
    } else {
      this.availableModules = [...STANDARD_MODULES];
    }

    // 2. Conecta ao FormControl
    const control = this.getControl();
    if (control) {
      this.syncFromControlValue(control.value);
      this.controlSub = control.valueChanges.subscribe(val => {
        const current = this.selectedModules;
        const incoming = Array.isArray(val) ? val : (typeof val === 'string' && val.trim() ? val.split(',').map((s: string) => s.trim()) : []);
        if (JSON.stringify(current) !== JSON.stringify(incoming)) {
          this.syncFromControlValue(val);
        }
      });
    }

    // 3. Configura filtro reativo do Auto-complete
    this.filteredOptions$ = this.inputCtrl.valueChanges.pipe(
      startWith(''),
      map((search: string | null) => this.filterModules(search || ''))
    );
  }

  ngOnDestroy(): void {
    this.controlSub?.unsubscribe();
  }

  private getControl(): FormControl | null {
    if (this.formControl) return this.formControl;
    if (this.formGroup && this.fieldName) {
      const ctrl = this.formGroup.get(this.fieldName);
      if (ctrl instanceof FormControl) return ctrl;
    }
    return null;
  }

  private syncFromControlValue(val: any): void {
    let keys: string[] = [];
    if (Array.isArray(val)) {
      keys = val.map(v => typeof v === 'string' ? v : v?.key || v?.name || String(v));
    } else if (typeof val === 'string' && val.trim().length > 0) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          keys = parsed.map(v => typeof v === 'string' ? v : v?.key || v?.name || String(v));
        } else {
          keys = val.split(',').map(s => s.trim()).filter(Boolean);
        }
      } catch {
        keys = val.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    this.selectedModules = keys;
  }

  private filterModules(value: string): IModuleItem[] {
    const filterValue = value.toLowerCase().trim();
    return this.availableModules.filter(mod => {
      const isAlreadySelected = this.selectedModules.some(
        sel => sel.toLowerCase() === mod.key.toLowerCase() || sel.toLowerCase() === mod.name.toLowerCase()
      );
      if (isAlreadySelected) return false;

      if (!filterValue) return true;
      return (
        mod.name.toLowerCase().includes(filterValue) ||
        mod.key.toLowerCase().includes(filterValue) ||
        mod.category.toLowerCase().includes(filterValue) ||
        (mod.shortDescription && mod.shortDescription.toLowerCase().includes(filterValue))
      );
    });
  }

  /**
   * Adiciona módulo digitado manualmente via input de chip (matChipInputTokenEnd)
   * Permite incluir módulos customizados/faltantes como "Agendamento Estética"
   */
  addChip(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      if (!this.selectedModules.some(s => s.toLowerCase() === value.toLowerCase())) {
        this.selectedModules.push(value);
        this.emitChanges();
      }
    }
    event.chipInput!.clear();
    this.inputCtrl.setValue('');
  }

  /**
   * Adiciona módulo selecionado da lista do Auto-complete
   */
  selectedOption(event: MatAutocompleteSelectedEvent): void {
    const selectedKey = event.option.value;
    if (selectedKey && !this.selectedModules.some(s => s.toLowerCase() === selectedKey.toLowerCase())) {
      this.selectedModules.push(selectedKey);
      this.emitChanges();
    }
    if (this.moduleInput) {
      this.moduleInput.nativeElement.value = '';
    }
    this.inputCtrl.setValue('');
  }

  /**
   * Remove chip de módulo selecionado
   */
  removeChip(moduleKey: string): void {
    const index = this.selectedModules.indexOf(moduleKey);
    if (index >= 0) {
      this.selectedModules.splice(index, 1);
      this.emitChanges();
    }
  }

  /**
   * Reordena módulos (sobe ou desce a prioridade na aplicação)
   */
  moveChip(index: number, direction: 'up' | 'down', event?: Event): void {
    if (event) event.stopPropagation();
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= this.selectedModules.length) return;

    const item = this.selectedModules[index];
    this.selectedModules.splice(index, 1);
    this.selectedModules.splice(target, 0, item);
    this.emitChanges();
  }

  getModuleIcon(key: string): string {
    const found = this.availableModules.find(m => m.key.toLowerCase() === key.toLowerCase() || m.name.toLowerCase() === key.toLowerCase());
    if (found) return found.icon;
    if (key.toLowerCase().includes('agend')) return 'event';
    if (key.toLowerCase().includes('ficha') || key.toLowerCase().includes('anamnese')) return 'assignment';
    return 'widgets';
  }

  isStandardModule(key: string): boolean {
    return this.availableModules.some(m => m.key.toLowerCase() === key.toLowerCase() || m.name.toLowerCase() === key.toLowerCase());
  }

  private emitChanges(): void {
    const control = this.getControl();
    if (control) {
      control.setValue([...this.selectedModules]);
      control.markAsDirty();
    }

    // Sincroniza também no formGroup em customRules para manter a combinação completa
    if (this.formGroup) {
      const cr = this.formGroup.get('customRules')?.value || {};
      const updatedRules = {
        ...cr,
        isCombinedApp: true,
        modules: [...this.selectedModules]
      };
      if (!this.formGroup.get('customRules')) {
        this.formGroup.addControl('customRules', new FormControl(updatedRules));
      } else {
        this.formGroup.get('customRules')?.setValue(updatedRules);
      }
    }
  }
}
