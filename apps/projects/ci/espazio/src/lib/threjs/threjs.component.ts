import { AfterViewInit, Component, ElementRef, HostListener, Input, NgZone, OnDestroy, Optional, ViewChild } from '@angular/core';
import { BoxGeometry, Color, DirectionalLight, Material, Mesh, MeshNormalMaterial, PerspectiveCamera, PointLight, Scene, WebGLRenderer } from 'three';
import { CoreModule } from '@ci/core';
// Importamos o OrbitControls junto com o GLTFLoader
import { GLTFLoader, OrbitControls } from 'three/addons';

/**
 * Objeto Espacial
 */
export class Objeto {
  scene?: Scene;
  mesh?: Mesh;
  visible?: boolean;
  peso?: number;
  densidade?: number;
  altura?: number;
  largura?: number;
  massa?: number;
  glb_file?: string;

  constructor(data?: { mesh?: Mesh, glb_file?: string }) {
    this.mesh = data?.mesh;
    this.glb_file = data?.glb_file;
  }

  loadGBL(glb_file: string = this.glb_file || '') {
    const loader = new GLTFLoader().setPath('./3d/');
    loader.load(glb_file, (gltf) => {
      this.scene?.add(gltf.scene);
    });
  }
}

@Component({
  selector: 'c-threjs',
  imports: [CoreModule],
  standalone: true,
  templateUrl: './threjs.component.html',
  styleUrl: './threjs.component.scss',
})
export class ThrejsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef<HTMLDivElement>;
  
  @Input() scene?: Scene;
  @Input() camera?: PerspectiveCamera;
  @Input() renderer?: WebGLRenderer;
  @Input() resizeObserver?: ResizeObserver;
  @Input() frameId: number = 0;

  // Nova propriedade para armazenar os controles da câmera
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
    this.scene.background = new Color(0x222222);
    
    const { clientWidth, clientHeight } = this.rendererContainer.nativeElement;
    
    this.camera = new PerspectiveCamera(75, clientWidth / clientHeight, 0.1, 1000);
    this.camera.position.z = 5;
    
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
    
    this.renderer.setSize(clientWidth, clientHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // Configurando o OrbitControls para rotacionar, dar zoom e mover a câmera
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // Adiciona uma inércia suave ao movimento
    this.controls.dampingFactor = 0.05;
    // this.controls.enablePan = false; // Descomente se não quiser que o usuário arraste a câmera para fora do centro
    // this.controls.enableZoom = true; // O zoom usando o scroll do mouse já vem ativado por padrão

    const light = new PointLight(0xffffff, 10000, 100);
    light.position.set(0, 40, -10);
    this.scene.add(light);

    if (this.objetos) {
      this.objetos.forEach(obj => {
        obj.scene = this.scene;
        if (!!obj.glb_file) obj.loadGBL();
      });
    }
  }

  private animate(): void {
    this.frameId = requestAnimationFrame(() => this.animate());
    
    // Atualiza os controles em cada frame (necessário quando enableDamping = true)
    if (this.controls) {
      this.controls.update();
    }

    if (this.scene && this.camera && this.renderer) {
      this.renderer.render(this.scene, this.camera);
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
    // Implementação de teclas se necessário
  }
}