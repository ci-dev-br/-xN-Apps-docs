export interface CalendarDay {
    date: Date;
    dayNumber: number;
    isCurrentMonth?: boolean;
    isToday?: boolean;
    isSelected?: boolean;
    hasEvents?: boolean;
}