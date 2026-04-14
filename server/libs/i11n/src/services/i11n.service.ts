import { Injectable, Optional } from "@nestjs/common";
import { Equal, Repository } from "typeorm";
import { Dictionary } from "../models/dictionary.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class I11nService {
    constructor(
        @Optional() @InjectRepository(Dictionary)
        private readonly dictionary_repository?: Repository<Dictionary>
    ) { }

    async getDictionaryByCodes(codes: string[], language_code: string) {


        const dicionaries = await this.dictionary_repository.findAndCount({
            where: {
                language: {
                    code: Equal(language_code)
                }
            }
        });

        return dicionaries;
    }
}