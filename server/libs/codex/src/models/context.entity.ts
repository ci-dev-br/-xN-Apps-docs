import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

export class Parameter<T> {
    valueStrinOf: string;
    value: T;
}

@Entity()
export class Context {
    // parameters?: Parameter<any>[];

    @ManyToMany(t => InstanceExecutor)
    Executor?: InstanceExecutor
}

/***
 *  Instancia de Executor registra as Instancias da Aplicação Cliente/Servidor registrada 
 * para processamento de informação; O processamento da Informação do sistema ocorre de
 * forma distribuída. Onde cada Nodo pode processar determinado conjunto de informações
 * de acordo com que é produzido pelo próprio usuário; Em caso de ausência de Nodos disponíveis
 * para o processamento desses dados, eles podem ser processados por intermédio de Nodos que possuem 
 * os módulos de Chaves de Processamento. As chaves de processamento dependem do módulo de chaves de 
 * acesso.
 * 
 * Dependendo da configuração, o processamento de determinada informação pode gerar uma
 * solicitação ativa por exemplo, para execução de determinado processamento. 
 * 
 */
@Entity()
export class InstanceExecutor {
    @PrimaryGeneratedColumn('uuid')
    ClientID?: string;
    /*  @Column({
         comment: 'Máximo de esforço em milissegundos de uma execução'
     })
     MaximumEsforceInMilliseconds?: number */

    @Column({ nullable: true })
    lastIp?: string;
}