import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn, TableInheritance } from "typeorm";
import { TipoAtivo } from "./tipo-ativo";
import { ProcessoINPI } from "./process-inpi.entity";
import { schema } from "./schema";

@Entity({ schema })
/* @TableInheritance({
  column: { name: 'tipo', type: 'varchar' }, // Coluna "discriminadora"
  //  pattern: 'STRING',
}) */
export abstract class AtivoIntelectual {
  @ApiProperty({ description: 'ID único do ativo' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Título ou nome do ativo' })
  @Column()
  titulo: string;

  @ApiProperty({ description: 'Descrição detalhada do ativo' })
  @Column({ type: 'text' })
  descricao: string;
  // O 'tipo' é preenchido automaticamente pelo TypeORM (MARCA ou PATENTE)
  @ApiProperty({ enum: TipoAtivo, description: 'Tipo do ativo' })
  @Column({ type: 'enum', enum: TipoAtivo, nullable: false })
  tipo: TipoAtivo;
  // Ligação inversa para o Processo
  @OneToOne(() => ProcessoINPI, (processo) => processo.ativo)
  processo: ProcessoINPI;
}