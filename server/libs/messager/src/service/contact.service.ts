import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Contact } from "../model/contact.entity";
import { InjectRepository } from "@nestjs/typeorm";
@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private readonly repo: Repository<Contact>
    ) { }
    async findContactByNameOrPhonenumber() {
        
    }
}