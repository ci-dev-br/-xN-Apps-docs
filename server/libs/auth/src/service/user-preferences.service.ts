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

    async getPreferences(userId: string): Promise<UserPreference[]> {
        if (!userId) return [];
        return await this.userPreferenceRepo.find({
            where: { userId },
        });
    }

    async getPreferencesMap(userId: string): Promise<Record<string, string>> {
        const list = await this.getPreferences(userId);
        const map: Record<string, string> = {};
        for (const item of list) {
            if (item?.code) {
                map[item.code] = item.value ?? '';
            }
        }
        return map;
    }

    async getPreference(userId: string, code: string): Promise<string | undefined> {
        if (!userId || !code) return undefined;
        const found = await this.userPreferenceRepo.findOne({
            where: { userId, code },
        });
        return found?.value;
    }

    async setNewPreference(userId: string, code: string, valueOfString: string): Promise<UserPreference | null> {
        if (!userId || !code) return null;
        try {
            let pref = await this.userPreferenceRepo.findOne({
                where: { userId, code },
            });
            if (!pref) {
                pref = this.userPreferenceRepo.create({
                    userId,
                    code,
                    value: valueOfString,
                });
            } else {
                pref.value = valueOfString;
            }
            return await this.userPreferenceRepo.save(pref);
        } catch (error) {
            console.trace(error);
            return null;
        }
    }

    async setPreferences(userId: string, prefs: Record<string, any>): Promise<Record<string, string>> {
        if (!userId || !prefs || typeof prefs !== 'object') {
            return this.getPreferencesMap(userId);
        }
        for (const [code, rawVal] of Object.entries(prefs)) {
            if (!code || rawVal === undefined) continue;
            const serialized = typeof rawVal === 'string' ? rawVal : JSON.stringify(rawVal);
            await this.setNewPreference(userId, code, serialized);
        }
        return await this.getPreferencesMap(userId);
    }
}
