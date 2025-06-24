/* tslint:disable */
/* eslint-disable */
import { PhoneNumber } from '../models/phone-number';
export interface Device {
  id: string | null;
  mac: string | null;
  numbers: Array<PhoneNumber> | null;
  type: string | null;
}
