import { Component, Input, OnInit } from "@angular/core";
import { CoreModule } from "@ci/core";
import { CalendarDay } from "./calendar-day";

@Component({
    selector: 'ci-calendar',
    imports: [
        CoreModule,
    ],
    standalone: true,
    templateUrl: `calendar.component.html`,
    styleUrl: `calendar.component.scss`,
})
export class CalendarComponent implements OnInit {

    currentViewDate: Date = new Date(); // Data de referência para o mês visível
    @Input() viewMode?: 'day' | 'month' | 'year';
    @Input() weekDays?: any[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    @Input() days?: CalendarDay[] = [
        { date: new Date(), dayNumber: 1, },
    ];
    @Input() current?: Date = new Date();
    @Input() selectedDate: Date = new Date();    // Data atualmente selecionada (inicia hoje)
    constructor() { }
    private generateCalendar(): void {
        this.days = [];

        // 1. Descobrir o primeiro dia do mês atual
        const year = this.currentViewDate.getFullYear();
        const month = this.currentViewDate.getMonth();

        // Primeiro dia do mês (ex: 1 de Dezembro)
        const firstDayOfMonth = new Date(year, month, 1);

        // Dia da semana em que cai o dia 1 (0 = Domingo, 1 = Segunda...)
        const startingDayOfWeek = firstDayOfMonth.getDay();

        // 2. Definir a data inicial da grade (pode ser no mês anterior)
        // Subtraímos os dias necessários para chegar no Domingo anterior
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - startingDayOfWeek);

        // 3. Gerar 42 dias (6 linhas x 7 colunas) para cobrir qualquer mês
        // 42 garante que a altura do calendário nunca muda
        const dateIterator = new Date(startDate);

        for (let i = 0; i < 42; i++) {

            const isCurrentMonth = dateIterator.getMonth() === month;

            this.days.push({
                date: new Date(dateIterator), // Importante: clonar a data!
                dayNumber: dateIterator.getDate(),
                isCurrentMonth: isCurrentMonth,
                isToday: this.isSameDay(dateIterator, new Date()),
                isSelected: this.isSameDay(dateIterator, this.selectedDate),
                hasEvents: this.checkIfHasEvents(dateIterator) // Lógica mockada
            });

            // Avança para o próximo dia
            dateIterator.setDate(dateIterator.getDate() + 1);
        }
    }
    private isSameDay(date1: Date, date2: Date): boolean {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }

    // Exemplo simples para simular eventos (ex: dias pares têm eventos)
    private checkIfHasEvents(date: Date): boolean {
        return date.getDate() % 5 === 0;
    }
    ngOnInit() {
        this.generateCalendar();
    }
    // --- Getters para o Cabeçalho ---

    get currentMonthName(): string {
        // Formata o mês em português (ex: "Dezembro")
        return this.currentViewDate.toLocaleDateString('pt-BR', { month: 'long' });
    }

    get currentYear(): number {
        return this.currentViewDate.getFullYear();
    }

    // --- Ações do Usuário ---

    prevMonth(): void {
        // Subtrai 1 mês da data de visualização
        this.currentViewDate = new Date(
            this.currentViewDate.getFullYear(),
            this.currentViewDate.getMonth() - 1,
            1
        );
        this.generateCalendar();
    }

    nextMonth(): void {
        // Soma 1 mês da data de visualização
        this.currentViewDate = new Date(
            this.currentViewDate.getFullYear(),
            this.currentViewDate.getMonth() + 1,
            1
        );
        this.generateCalendar();
    }

    goToToday(): void {
        this.currentViewDate = new Date(); // Volta a visualização para o mês atual
        this.selectedDate = new Date();    // Seleciona o dia de hoje
        this.generateCalendar();
    }

    selectDate(day: CalendarDay): void {
        this.selectedDate = day.date;

        // Se clicar num dia cinza (outro mês), muda a visualização para aquele mês
        if (!day.isCurrentMonth) {
            this.currentViewDate = new Date(day.date);
        }

        this.generateCalendar(); // Regenera para atualizar a classe .is-selected

        // Aqui você emitiria um evento, ex: this.dateSelected.emit(this.selectedDate);
        console.log('Data Selecionada:', this.selectedDate);
    }

}