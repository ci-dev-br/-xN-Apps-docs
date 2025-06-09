/* tslint:disable */
/* eslint-disable */
import { Option } from '../models/option';
export interface Pergunta {
  options?: Array<Option> | null;
  questao?: string | null;
  type?: string | null;
}
