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
            secretOrKey: jwtConstants.secret,
            passReqToCallback: true,
        });
    }
    validate(request: Request, payload: any) {
        const refreshToken = request.get('Authorization').replace('Bearer', '').trim();
        return {
            ...payload, refreshToken
        };
    }
}