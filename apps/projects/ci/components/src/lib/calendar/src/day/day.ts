import { Component, HostListener, Input, OnInit } from "@angular/core";
import { CoreModule } from "@ci/core";

@Component({
    selector: 'ci-day',
    templateUrl: 'day.html',
    styleUrl: 'day.scss',
    standalone: true,
    imports: [
        CoreModule,
    ]
})
export class Day implements OnInit {
    markerTopPosition = 0;
    @Input() selectedDate: Date = new Date();    // Data atualmente selecionada (inicia hoje)
    currentTime?: Date;
    currentTimeString = '';
    readonly HOUR_HEIGHT = 20;
    hours: number[] = Array.from({ length: 24 }, (_, i) => i); // [0, 1, ..., 23]
    get isToday(): boolean {
        const now = new Date();
        return this.selectedDate.getDate() === now.getDate() &&
            this.selectedDate.getMonth() === now.getMonth() &&
            this.selectedDate.getFullYear() === now.getFullYear();
    }
    private timerId: any;
    ngOnInit() {
        // this.generateCalendar();
        this.updateTimeMarker();
        this.timerId = setInterval(() => {
            this.updateTimeMarker();
        }, 1000);
    }
    private updateTimeMarker(): void {
        if (!this.isToday) return;
        const now = new Date();
        // Cálculo: (Horas * 60) + Minutos = Total de minutos passados no dia
        // Como definimos que 1 hora = 60px, então 1 minuto = 1px.
        // Se quiser alterar a altura, a fórmula é: (minutos * (HOUR_HEIGHT / 60))
        const minutesPassed = (now.getHours() * 60) + now.getMinutes();
        // Calcula a posição em pixels baseada na altura da linha (ratio)
        const pixelsPerMinute = this.HOUR_HEIGHT / 60;
        this.markerTopPosition = minutesPassed * pixelsPerMinute;
        // Formata string para mostrar na bolinha (ex: "14:35")
        this.currentTime = now;
        this.currentTimeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // novoRegistro: E
    @HostListener('mousedown', ['$event'])
    mousedownHanlder(event: MouseEvent) {

    }

    @HostListener('mouseup', ['$event'])
    mouseupHanlder(event: MouseEvent) {

    }
}