import { AfterViewInit, Component, ElementRef, HostListener, Input, NgZone, OnDestroy, Optional, ViewChild } from '@angular/core';
import { AnimationMixer, Mesh, PerspectiveCamera, PointLight, Scene, WebGLRenderer, Clock, PCFSoftShadowMap } from 'three';
import { CoreModule } from '@ci/core';
// Importamos o OrbitControls junto com o GLTFLoader
import { OrbitControls } from 'three/addons';
import { Objeto } from '../engine/objeto';
import { Player } from '@ci/espazio';

@Component({
  selector: 'c-threjs',
  imports: [CoreModule],
  standalone: true,
  templateUrl: './threjs.component.html',
  styleUrl: './threjs.component.scss',
})
export class ThrejsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef<HTMLDivElement>;
  @Input() mixer?: AnimationMixer;
  @Input() scene?: Scene;
  @Input() camera?: PerspectiveCamera;
  @Input() renderer?: WebGLRenderer;
  @Input() resizeObserver?: ResizeObserver;
  @Input() frameId: number = 0;
  lights: PointLight[] = [];
  clock = new Clock();
  controls?: OrbitControls;
  private _objetos?: Objeto[] | undefined;
  public get objetos(): Objeto[] | undefined {
    return this._objetos;
  }
  @Input()
  public set objetos(value: Objeto[] | undefined) {
    if (this._objetos === value) return;
    this._objetos = value;
  }
  adicionarObjeto(objeto: Objeto) {
    if (!this.objetos) {
      this.objetos = [];
    }
    objeto.scene = this.scene;
    return objeto;
  }
  adicionarMesh(mesh: Mesh): Objeto {
    return this.adicionarObjeto(new Objeto({ mesh }));
  }
  constructor(@Optional() private readonly ngZone?: NgZone) { }
  private get localPlayer(): Player | undefined {
    return this.objetos?.find(obj => obj instanceof Player) as Player;
  }

  ngAfterViewInit(): void {
    this.initThree();
    this.setupResizeObserver();
    // Executa a animação fora do zone do Angular para performance
    this.ngZone?.runOutsideAngular(() => {
      this.animate();
    });
  }
  ngOnDestroy(): void {
    // Limpeza crucial para evitar vazamento de memória (memory leaks)
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    cancelAnimationFrame(this.frameId);

    // Limpa os controles da câmera
    if (this.controls) {
      this.controls.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThree(): void {
    this.scene = new Scene();
    // this.scene.background = new Color(0x22222200);

    const { clientWidth, clientHeight } = this.rendererContainer.nativeElement;

    // this.camera = new PerspectiveCamera(75, clientWidth / // clientHeight, 0.1, 1000);
    // this.camera.position.z = 5;
    // this.camera.position.y = 1;

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      depth: true,
      logarithmicDepthBuffer: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
      stencil: true,
      powerPreference: 'high-performance',
      precision: 'highp'
    });

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    this.renderer.setSize(clientWidth, clientHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // Configurando o OrbitControls para rotacionar, dar zoom e mover a câmera
    if (this.camera) {

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true; // Adiciona uma inércia suave ao movimento
      this.controls.dampingFactor = 0.05;
      this.controls.enablePan = false; // Descomente se não quiser que o usuário arraste a câmera para fora do centro
      this.controls.enableZoom = true; // O zoom usando o scroll do mouse já vem ativado por padrão
    }

    const light = new PointLight(0xffffff, 10, 100);

    this.lights.push(light);
    light.position.set(0, 40, -10);
    this.scene.add(light);

    if (this.objetos) {
      this.objetos.forEach(async obj => {
        obj.scene = this.scene;
        if (!!obj.glb_file) {
          // await obj.loadGBLFile();
          if (!this.mixer && obj.scene) this.mixer = new AnimationMixer(obj.scene)
          /*  if (!!obj?.gltf?.animations) this.mixer?.clipAction(obj.gltf.animations[5]).play(); */
          if (!!obj?.gltf?.animations && Array.isArray(obj.gltf.animations)) {
            obj.animations = obj.gltf.animations.map(x => this.mixer!.clipAction(x))
          }
        }
      });
    }
  }

  private animate(): void {
    try {
      const delta = this.clock.getDelta();
      this.frameId = requestAnimationFrame(() => this.animate());

      this.mixer?.update(delta);

      /*  if (!!this.controls) {
         this.controls?.update();
       } */

      if (this.scene && this.camera && this.renderer) {
        this.renderer.render(this.scene, this.camera);
      }
    } catch (err) {
      console.trace(err);
    }
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        this.updateDimensions(width, height);
      }
    });
    this.resizeObserver.observe(this.rendererContainer.nativeElement);
  }

  private updateDimensions(width: number, height: number): void {
    if (!this.camera || !this.renderer) return;
    const h = height > 0 ? height : 1;
    this.camera.aspect = width / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, h);
  }

  @HostListener('window:keydown', ['$event'])
  async keydownHandler(event: KeyboardEvent) {
    /*  if (event.key === 'w') {
       this.camera!.position!.z -= 1;
     }else if (event.key === 's') {
       this.camera!.position!.z += 1;
     }
     if (event.key === 'a') {
       this.camera!.position!.x -= 1;
     }else if (event.key === 'd') {
       this.camera!.position!.x += 1;
     } */
  }
  @HostListener('window:keyup', ['$event'])
  async keyupHandler(event: KeyboardEvent) {
    /*  if (event.key === 'w') {
       this.camera!.position!.z -= 1;
     }else if (event.key === 's') {
       this.camera!.position!.z += 1;
     }
     if (event.key === 'a') {
       this.camera!.position!.x -= 1;
     }else if (event.key === 'd') {
       this.camera!.position!.x += 1;
     } */
  }
}