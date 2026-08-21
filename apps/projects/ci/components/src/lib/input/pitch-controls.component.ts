import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
export interface PitchSettings {
    pitchTolerance: number;
    minVolume: number;
    minHz: number;
    maxHz: number;
    minSamples: number;
    debugPitch: boolean;
}
@Component({
    selector: 'app-pitch-controls',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './pitch-controls.component.html',
    styleUrls: ['./pitch-controls.component.scss']
})
export class PitchControlsComponent implements OnInit {
    // Valores padrão baseados na sua especificação
    @Input() initialSettings: PitchSettings = {
        pitchTolerance: 5.6,
        minVolume: 0,
        minHz: 60,
        maxHz: 700,
        minSamples: 1,
        debugPitch: true
    };
    // Emite as novas configurações para o componente pai sempre que algo mudar
    @Output() settingsChange = new EventEmitter<PitchSettings>();
    controlsForm!: FormGroup;
    constructor(private fb: FormBuilder) { }
    ngOnInit(): void {
        this.controlsForm = this.fb.group({
            pitchTolerance: [this.initialSettings.pitchTolerance],
            minVolume: [this.initialSettings.minVolume],
            minHz: [this.initialSettings.minHz],
            maxHz: [this.initialSettings.maxHz],
            minSamples: [this.initialSettings.minSamples],
            debugPitch: [this.initialSettings.debugPitch]
        });
        // Escuta qualquer mudança no formulário e emite o novo objeto
        this.controlsForm.valueChanges.subscribe((value: PitchSettings) => {
            this.settingsChange.emit(value);
        });
    }
}