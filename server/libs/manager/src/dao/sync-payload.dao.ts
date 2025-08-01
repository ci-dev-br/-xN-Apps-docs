import { ApiProperty } from "@nestjs/swagger";

export class SyncPayloadDao<Entity> {
    @ApiProperty()
    data?: Entity;
}