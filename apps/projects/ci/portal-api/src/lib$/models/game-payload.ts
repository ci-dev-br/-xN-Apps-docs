/* tslint:disable */
/* eslint-disable */
import { Move } from '../models/move';
export interface GamePayload {
  fen?: string | null;
  move?: Move | null;
  partidaInternalId?: string | null;
}
