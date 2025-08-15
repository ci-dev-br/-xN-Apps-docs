import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * # CI Application Service
 * 
 */
@Injectable()
export class CiApplicationService {
    constructor() { }

    getHost(req: Request) {
        return (req.header('x-From') || req.query.from || req.hostname) as string;
    }
}
