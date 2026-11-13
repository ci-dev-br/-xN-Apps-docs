import { Component } from "@angular/core";


// builder.service.ts
export interface BlockState {
  x: number;
  y: number;
  z: number;
  type: string;
}

/* 
// Assumindo que você adicione os blocos instanciados a este array durante o clique
private builtBlocks: THREE.Mesh[] = [];
public exportScene(): BlockState[] {
  return this.builtBlocks.map(block => ({
    x: block.position.x,
    y: block.position.y,
    z: block.position.z,
    type: block.userData['type'] || 'default'
  }));
}
public loadScene(blocks: BlockState[]): void {
  blocks.forEach(b => {
    const position = new THREE.Vector3(b.x, b.y, b.z);
    this.spawnBlockAt(position, b.type);
  });
}
private spawnBlockAt(position: THREE.Vector3, type: string): void {
  const block = new THREE.Mesh(this.blockGeometry, this.blockMaterial);
  block.position.copy(position);
  block.userData = { type };
  this.scene.add(block);
  this.builtBlocks.push(block);
  this.worldOctree.fromGraphNode(block); // Reconstrói colisões
}
*/
@Component({
  standalone: true,
  imports: [

  ],
  template: `<div class="content" >X</div>
    `
})
export class MBVerso {
  /**
   * 1. menu do jogo
   * 
   * lore do jogo
   * 
   * 2. launge, criação do personagem
   * 
   * 3. visitar a cidade nova
   * 
   * 4. criar musicas
   * 
   * 5. lançar discos
   * 
   * 6. agendar shows
   * 
   * 7. farmar publico nas cidades com shows
   * 
   * ~~~ pontuação ~~~
   * 
   * FIN
   */
  stage: 'launge' | 'menu' | 'city' = 'menu';
  constructor() { }
  start() { }
  exit() { }
  createProfile() {
    this.stage = 'launge';
  }
}