import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { UserPreference } from "../models/user-preference.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UserPreferencesService {

    constructor(
        @InjectRepository(UserPreference)
        private readonly userPreferenceRepo: Repository<UserPreference>,

    ) { }

    async setNewPreference(userId: string, code: string, valueOfString: string) {
        try {
            this.userPreferenceRepo.save({

            })

        } catch (error) { console.trace(error); }
    }
}