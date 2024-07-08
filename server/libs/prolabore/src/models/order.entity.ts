import { User } from "@ci/auth/models/user.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ schema: 'prolabore' })
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
}