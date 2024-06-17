export interface ILoadListOptions<T> {
    position?: number;
    size?: number;
    filter?: { [P in keyof T]?: ['max' | 'min' | 'equal' | 'diff', any] };
    loadData?: { [P in keyof T]?: boolean };
}