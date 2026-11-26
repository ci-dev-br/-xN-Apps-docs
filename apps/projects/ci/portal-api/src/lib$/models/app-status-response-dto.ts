/* tslint:disable */
/* eslint-disable */
export interface AppStatusResponseDto {
  logs: Array<string>;
  porta?: number;

  /**
   * offline | starting | online | error
   */
  status: string;
}
