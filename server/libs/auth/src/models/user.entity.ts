import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Policy } from "./policy.entity";
import { Tenant } from "@ci/tenant/models/tenant.entity";
import { Photo } from "@ci/storage/models/photo.entity";


@Entity()
export class User {
    @ApiProperty({ required: false, nullable: true })
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @Column({ unique: true })
    @ApiProperty({ required: false, nullable: true })
    username?: string;
    @ApiProperty({ required: false, nullable: true })
    @Column({ nullable: true })
    fullName?: string;
    @Column({ nullable: true })
    @Exclude({ toPlainOnly: true })
    password?: string;
    @Column({ nullable: true, unique: true })
    @ApiProperty({ required: false, nullable: true })
    email?: string;
    @Column({ nullable: true })
    @ApiProperty({ required: false, nullable: true })
    phone?: string;
    // @ApiProperty({ required: false, nullable: true })
    @ApiProperty({ required: false, nullable: true })
    @Column({ nullable: true, type: 'varchar', array: true, default: ['USER'] })
    roles?: string[];
    @ApiProperty({ required: false, nullable: true, isArray: true, type: Policy })
    @ManyToMany(() => Policy) @JoinTable()
    permission?: Policy[];
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    refreshToken?: string;
    @ApiProperty({ nullable: true, required: false, type: Tenant, isArray: true })
    @ManyToMany(() => Tenant)
    @JoinTable()
    tenants?: Tenant[];
    @ApiProperty({ nullable: true, required: false, type: Photo })
    @ManyToOne(() => Photo)
    @JoinColumn()
    photo?: Photo;
}