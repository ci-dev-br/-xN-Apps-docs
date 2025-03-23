/* tslint:disable */
/* eslint-disable */
export interface ISendMessagePayload {
}

export class SendMessagePayload implements ISendMessagePayload {
  static typeName = 'SendMessagePayload';
  toJSON(): ISendMessagePayload{
    return {
    }
  }
}
