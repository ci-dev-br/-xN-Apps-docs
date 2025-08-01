/* tslint:disable */
/* eslint-disable */
import { PhoneNumber } from '../models/phone-number';
export interface DevicePayload {
  applicationId?: string | null;
  authentication?: string | null;
  id?: string | null;
  mac?: string | null;
  model?: string | null;
  name?: string | null;
  numbers?: Array<PhoneNumber> | null;
}
