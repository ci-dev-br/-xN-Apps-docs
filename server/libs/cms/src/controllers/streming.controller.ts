import { Body, Controller, Post } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export class StreamingPayload {
    size?: number;
    path?: string;
    format?: string;
    internalId?: string;
}

/**
 * 
 */
@ApiResponse({})
@Controller('Streaming')
export class StreamingController {
    constructor() { }
    @ApiResponse({
        type: StreamingPayload,
    })
    @Post()
    async GetChunk(@Body() payload: StreamingPayload) {

    }
}