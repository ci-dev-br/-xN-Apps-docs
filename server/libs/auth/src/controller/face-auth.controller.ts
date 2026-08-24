// face-auth.controller.ts
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { FaceAuthService } from '../service/face-auth.service';

@Controller('auth/face')
export class FaceAuthController {
    constructor(private readonly faceAuthService: FaceAuthService) { }

    @Post('register')
    register(@Body() body: { name: string; descriptor: number[] }) {
        return this.faceAuthService.register(body.name, body.descriptor);
    }

    @Post('login')
    async login(@Body() body: { descriptor: number[] }) {
        const user = await this.faceAuthService.recognize(body.descriptor);
        if (!user) {
            throw new UnauthorizedException('Rosto não reconhecido');
        }
        return { message: 'Autenticado com sucesso', user };
    }
}