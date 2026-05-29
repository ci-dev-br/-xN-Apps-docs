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
        try {
            return (req.header('x-From') || req.query.from || req.hostname) as string;
        } catch (error) {
            console.trace(error)
        }
    }
}
