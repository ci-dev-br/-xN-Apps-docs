/* tslint:disable */
/* eslint-disable */
import { CardOption } from '../models/card-option';
export interface Card {
  componentName?: string | null;
  componentVersion?: string | null;
  settings?: CardOption | null;
  cols?: number | null;
  rows?: number | null;
  title?: string | null;
  inputs?: any | null;
}
