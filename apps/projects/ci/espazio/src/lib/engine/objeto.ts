import { Vector3, Scene, Mesh, AnimationAction } from 'three';
import { Octree, Capsule, GLTFLoader } from 'three/examples/jsm/Addons.js';

/**
 * Objeto Espacial
 */
export class Objeto {
  private static readGltf(obj: Objeto, gltf: any) {
    obj.gltf = gltf;
    obj.scene?.add(gltf.scene);
  }
  protected worldOctree = new Octree();

  protected playerCollider = new Capsule(new Vector3(0, 0.35, 0), new Vector3(0, 1, 0), 0.35);

  protected playerVelocity = new Vector3();
  protected playerDirection = new Vector3();

  protected playerOnFloor = false;
  protected mouseTime = 0;

  // Nova propriedade para armazenar os controles da câmera
  //  controls?: OrbitControls;
  controls?: any;

  // Dicionário para guardar quais teclas estão pressionadas
  protected keyStates: { [key: string]: boolean } = {};
  protected speed: number = 25; // Velocidade de caminhada

  protected vector1 = new Vector3();
  protected vector2 = new Vector3();
  protected vector3 = new Vector3();
  animations?: AnimationAction[];

  GRAVITY: number = 10;
  scene?: Scene;
  mesh?: Mesh;
  visible?: boolean;
  peso?: number;
  densidade?: number;
  altura?: number;
  largura?: number;
  massa?: number;
  glb_file?: string;

  gltf?: { scene?: Scene; animations: any[]; };
  controller?: (event: Event) => void;
  constructor(data?: { mesh?: Mesh; glb_file?: string; controller?: (event: Event) => void; }) {
    this.mesh = data?.mesh;
    this.glb_file = data?.glb_file;
    this.controller = data?.controller;
  }
  async loadGBLFile(glb_file: string = this.glb_file || '') {
    return await new Promise<void>((res, rej) => {
      try {
        const gltf_loader = new GLTFLoader().setPath('./3d/');
        gltf_loader.load(glb_file, (gltf) => {
          Objeto.readGltf(this, gltf);
          res();
        });
      } catch (error) {
        rej(error);
      }
    });
  }
  // Método que recebe os eventos do Angular
  controlHandler(event: KeyboardEvent) {
    if (event.type === 'keydown') {
      this.keyStates[event.code] = true;
    } else if (event.type === 'keyup') {
      this.keyStates[event.code] = false;
    }
  }
  updatePlayer(deltaTime: number) {
    let damping = Math.exp(- 4 * deltaTime) - 1;
    if (!this.playerOnFloor) {
      this.playerVelocity.y -= this.GRAVITY * deltaTime;
      // small air resistance
      damping *= 0.1;
    }
    this.playerVelocity.addScaledVector(this.playerVelocity, damping);
    const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);
    this.playerCollider.translate(deltaPosition);
    // playerCollisions();
    // camera.position.copy(this.playerCollider.end);
  }
}
