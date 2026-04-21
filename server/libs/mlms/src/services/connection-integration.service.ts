import { Injectable, Optional } from "@nestjs/common";
import { Repository } from "typeorm";
import { ConnectionIntegration } from "../models/connection-integration.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ConnectionIntegrationService {
    constructor(
        @Optional() @InjectRepository(ConnectionIntegration)
        private readonly connection_int_rep?: Repository<ConnectionIntegration>
    ) { }

    async autenticar() {

    }
}