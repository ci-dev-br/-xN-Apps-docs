import { ApiProperty } from "@nestjs/swagger";
import { User } from "@ci/auth/models/user.entity";
import { FullAuditedEntity } from "@ci/core";
import { Column, Entity, ManyToMany } from "typeorm";

@Entity({
    schema: 'cms',
})
export class Website extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @Column({ type: 'jsonb' })
    atributes: { [atributeCodename: string]: string };
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    name?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    domain?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    theme?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ type: 'varchar', array: true })
    modules?: string[];
    @ApiProperty({ nullable: true, required: false })
    @ManyToMany(type => User)
    admin?: User;
    @ApiProperty({ nullable: true, required: false })
    @ManyToMany(type => User)
    users?: User[];
}