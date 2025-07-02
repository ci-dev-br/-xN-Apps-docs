/* tslint:disable */
/* eslint-disable */
import { PhoneNumber } from '../models/phone-number';
export interface Device {
  changedAt: string;
  createdAt: string;
  id: string | null;
  mac: string | null;
  numbers: Array<PhoneNumber> | null;
  phones: Array<PhoneNumber>;
  type: string | null;
}
