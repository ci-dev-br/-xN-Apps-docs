import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ci-hud-overlay',
  standalone: true,
  template: `
    <header class="hud-info">
      <p><strong>Octree Collisions</strong> — Static Triangle Mesh</p>
      <p>MOUSE para olhar e lançar esferas • WASD mover • SPACE pular</p>
    </header>

    <aside class="hud-controls" (mousedown)="$event.stopPropagation()">
      <label>
        <input
          type="checkbox"
          [checked]="debugMode"
          (change)="onToggleDebug($event)"
        />
        Exibir Octree Debug
      </label>
    </aside>
  `,
  styles: [`
    :host {
      pointer-events: none;
      position: absolute;
      inset: 0;
      z-index: 10;
      font-family: system-ui, sans-serif;
      color: #fff;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
    }

    .hud-info {
      position: absolute;
      top: 12px;
      width: 100%;
      text-align: center;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .hud-info p {
      margin: 0;
    }

    .hud-controls {
      pointer-events: auto;
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(15, 23, 42, 0.75);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      backdrop-filter: blur(4px);
    }

    .hud-controls label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }
  `]
})
export class HudOverlayComponent {
  @Input() debugMode = false;
  @Output() debugModeChange = new EventEmitter<boolean>();

  onToggleDebug(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.debugModeChange.emit(checked);
  }
}