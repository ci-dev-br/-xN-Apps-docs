import { Clock } from "three";
import { Player } from "./player";

/**
 * Objeto de Mundo, registra as informações do mundo, concentrando a
 * lógica de carga dos objetos das cenas dos jogadores (Player) e
 * armazenando a lista de jogadores presentes no mundo.
 * 
 * O Objeto de Mundo instanciado representa apenas uma
 * linha de tempo. Para acessar outras linhas é necessário 
 * instanciar novo mundo.
 */
export class World extends Object {
    constructor(
        clock: Clock, values: any
    ) {
        super(values); this.clock = clock;
    }
    /**
     * Seeds para geração expontânea do mundo.
     */
    seeds?: { [code: string]: string };
    rp?: any;
    players?: Player[];
    /**
     * Objetos carregados pelas 
     * interações dos playes.
     */
    objects?: Object[];
    /* tempo global do mundo */
    clock?: Clock;
    /* Adcionar Player */
    async singin(player: Player) { }
    /* Remover Player */
    async singout(player: Player) { }
    /* Expulsar Player */
    async quick(player: Player) { }
}