
> Dados grandes que podem ser modificados devem ser enviados via git-sync protocol;

 O git sync protocol pode ser implementado sem ou com git como engine. Mas não precisa. Cada ponto da rede, seja CDN, Cache ou DB possui uma versão da informação, e transaciona apenas o hash da posição atual; Dessa forma, trafega sempre epanas o hash, e o git conta a história da informação; O git pode ser armazenado como arquivo ou local físico em VM;

 > Correção em serrealização;

 