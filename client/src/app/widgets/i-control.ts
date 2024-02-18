export interface IControl {
    type?: string;
    label?: string;
    maxLength?: number;
    getValue?: () => number;
}