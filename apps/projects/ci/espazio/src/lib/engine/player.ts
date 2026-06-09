import { Objeto } from "./objeto";

/**
 * Objeto de Jogador
 * Os objetos de jogador recebem uma mecânica adicional. 
 * 
 * todos jogadores se enxergam mutuamente. 
 * os demais objetos só existem para os jogadores que 
 * estão na ára de visão do objeto.
 * 
 * o octre calcula todos os jogadores mais os objetos
 * no campo de visão.
 * 
 * A informação pode ser corrigida pelos clientes que 
 * estão interagindo com o objeto.
 * 
 * Quando mais de um jogador enxerga um objeto 
 * ele sai de cache e passa a ser persistido.
 * 
 * Os players sempre estão em cache e não
 * são persistidos.
 * 
 * Os objetos são gerados proceduralmente com os 
 * seeds do universo. Quando um Player interage com uma região ela é 
 * persistida, mas os objetos possuem um tempo de vida, se passarem muito 
 * tempo sem interagir somem e a região fica disponível para a geração
 * expontânea.
 * 
 * Um dos seeds é o próprio tempo que é universal mas relativo. 
 * Podendo estar em tempos diferentes nas mesmas regiões.
 * E regiões de tempo inteiras podem se deslocar no espaço através do
 * tempo.
 */
export class Player extends Objeto {
    static self: Player;
    lore?: [Date, any][];
    narrador?: any;
    skills?: { [code: string]: number };


}