import { User } from "@ci/auth/models/user.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({ schema: 'prolabore' })
export class Contrato {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
}