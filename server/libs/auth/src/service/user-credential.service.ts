import { Injectable } from "@nestjs/common";
import { AccessCredential } from "../models/user-credential.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
@Injectable()
export class UserCredentialService {
    constructor(
        @InjectRepository(AccessCredential)
        private readonly userRepo: Repository<AccessCredential>,
    ) { }
    async credenciar(
        userId: string,
    ) {
        const operables = await this.userRepo.find({
            where: {
                userIdentification: userId,
                operable: true,
                refreshToken: null
            }
        });
        if (!operables || operables.length === 0) {
            this.userRepo.create({
                createdAt: new Date(),
                modifiedAt: new Date(),
                userIdentification: userId,
            })
        }
        // return await ()
    }
}