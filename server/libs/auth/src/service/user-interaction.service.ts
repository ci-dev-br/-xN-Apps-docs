import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserInteraction } from "../models/user-interaction.entity";



/***
 * User Interaction Service
 * 
 */
@Injectable()
export class UserInteractionService {
    constructor(
        @InjectRepository(UserInteraction)
        private repository: Repository<UserInteraction>
    ) { }
    public async interaction(userIdentification: string, tag?: string, objectId?: string) {
        const interaction = await this.repository.create({
            tag, objectIdentification: objectId
        })
        await this.repository.save(interaction);
        return interaction;
    }
}