/* tslint:disable */
/* eslint-disable */
import { CardOption } from '../models/card-option';
export interface Card {
  cols?: number | null;
  componentName?: string | null;
  componentVersion?: string | null;
  rows?: number | null;
  settings?: CardOption | null;
  title?: string | null;
}
