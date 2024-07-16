import { Public } from "@ci/auth/decorators/public.decorator";
import { Body, Controller, Injectable, Post, Req, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";

@ApiTags('Server')
@Controller('Server')
export class ServerController {
    constructor(
        // private readonly server: 
    ) { }

    // @Post('Log')
    // @Public()
    // Log(@Body() data: any) {
    //     console.log('[[Log]]', JSON.stringify(data, null, 2));
    //     return '';
    // }
} 