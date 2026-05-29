import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt'
import { jwtConstants } from "../constants";
import { Request } from "express";
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh',) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.MASTER_PASSWORD_AUTHORYTHY || jwtConstants.secret,
            passReqToCallback: true,
        });
    }
    /**
     * Validação da autorização
     * @param request 
     * @param payload 
     * @returns 
     */
    validate(request: Request, payload: any) {
        try {
            const refreshToken = request.get('Authorization')
                .replace('Bearer', '').trim();
            return {
                ...payload,
                refreshToken
            };
        } catch (error) {
            console.trace(error);
        }
    }
}