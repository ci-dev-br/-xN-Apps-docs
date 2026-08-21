export interface IPivot<T> {
    fieldName: string;
    occurrence?: 'equal' | 'ilike';
    compareFunction?: (a: T, b: T) => boolean;
}
