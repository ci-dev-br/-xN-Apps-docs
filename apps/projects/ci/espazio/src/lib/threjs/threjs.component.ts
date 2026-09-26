import { AfterViewInit, Component, ElementRef, HostListener, Input, NgZone, OnDestroy, Optional, ViewChild, Output, EventEmitter } from '@angular/core';
import { AnimationMixer, Mesh, PerspectiveCamera, PointLight, Scene, WebGLRenderer, Clock, PCFSoftShadowMap, Raycaster, Vector2, Vector3, PlaneGeometry, MeshBasicMaterial, DoubleSide } from 'three';
import { CoreModule } from '@ci/core';
import { OrbitControls } from 'three/addons';
import { Objeto } from '../engine/objeto';
import { Player } from '@ci/espazio';
export interface ThreeClickEvent {
  meshName: string;
  point: Vector3;
  objectPosition: Vector3;
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
  private isDragging = false;
  private pointerDownPosition = new Vector2();
  @Input() mixer?: AnimationMixer;
  @Input() scene?: Scene;
  @Input() camera?: PerspectiveCamera;
  @Input() renderer?: WebGLRenderer;
  @Input() resizeObserver?: ResizeObserver;
  @Input() frameId: number = 0;
  @Output() objectClicked = new EventEmitter<ThreeClickEvent>();
  lights: PointLight[] = [];
  clock = new Clock();
  controls?: OrbitControls;
  // Propriedades para Raycasting
  private raycaster = new Raycaster();
  private mouse = new Vector2();
  private _objetos?: Objeto[] | undefined;
  public get objetos(): Objeto[] | undefined {
    return this._objetos;
  }
  @Input()
  public set objetos(value: Objeto[] | undefined) {
    if (this._objetos === value) return;
    this._objetos = value;
  }
  constructor(@Optional() private readonly ngZone?: NgZone) { }
  private get localPlayer(): Player | undefined {
    return this.objetos?.find(obj => obj instanceof Player) as Player;
  }
  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent) {
    this.pointerDownPosition.set(event.clientX, event.clientY);
    this.isDragging = false;
  }
  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {
    // Ignora o clique se o rato se mover mais de 5 píxeis (arrasto de câmara)
    if (this.pointerDownPosition.distanceTo(new Vector2(event.clientX, event.clientY)) > 5) {
      this.isDragging = true;
    }
  }
  @HostListener('pointerup', ['$event'])
  onPointerUp(event: PointerEvent) {
    if (this.isDragging || !this.camera || !this.scene) return;

    const rect = this.rendererContainer.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    const hit = intersects.find(i => i.object !== this.highlightMesh);

    if (hit) {
      // Cria um vetor para extrair a posição global absoluta da malha
      const worldPos = new Vector3();
      hit.object.getWorldPosition(worldPos);

      this.objectClicked.emit({
        meshName: hit.object.name,
        point: hit.point,
        objectPosition: worldPos // Agora enviamos o centro exato da peça no mundo 3D
      });
    }
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
  ngAfterViewInit(): void {
    this.initThree();
    this.setupResizeObserver();
    this.ngZone?.runOutsideAngular(() => {
      this.animate();
    });
  }
  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    cancelAnimationFrame(this.frameId);
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
  private initThree(): void {
    this.scene = new Scene();
    const { clientWidth, clientHeight } = this.rendererContainer.nativeElement;
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
    if (this.camera) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.enablePan = false;
      this.controls.enableZoom = true;
    }
    const light = new PointLight(0xffffff, 10, 100);
    this.lights.push(light);
    light.position.set(0, 40, -10);
    this.scene.add(light);
    // 1. Criar a malha de Highlight (um quadrado ligeiramente menor que o step 1.714)
    const geometry = new PlaneGeometry(1.65, 1.65);
    const material = new MeshBasicMaterial({
      color: 0x7b61ff, // Cor roxa igual ao CSS do Angular
      transparent: true,
      opacity: 0.6,
      side: DoubleSide,
      depthWrite: false // Previne flickering (z-fighting) com outras peças
    });
    this.highlightMesh = new Mesh(geometry, material);
    this.highlightMesh.rotation.x = -Math.PI / 2; // Deita o plano no eixo X
    this.highlightMesh.position.y = 0.26; // Eleva o plano acima da base do tabuleiro (y=0.25)
    this.highlightMesh.visible = false;   // Inicia escondido
    this.scene.add(this.highlightMesh);
    if (this.objetos) {
      this.objetos.forEach(async obj => {
        obj.scene = this.scene;
        if (!!obj.glb_file) {
          // Assegura que o GLB seja carregado fisicamente antes de procurar animações
          if (typeof obj.loadGBLFile === 'function') {
            await obj.loadGBLFile();
          }
          if (!this.mixer && obj.scene) this.mixer = new AnimationMixer(obj.scene);
          if (!!obj?.gltf?.animations && Array.isArray(obj.gltf.animations)) {
            obj.animations = obj.gltf.animations.map(x => this.mixer!.clipAction(x));
          }
        }
      });
    }
  }
  public setHighlight(rank: number | null, file: number | null) {
    if (!this.highlightMesh) return;
    // Se o clique for para limpar a seleção ou inválido
    if (rank === null || file === null) {
      this.highlightMesh.visible = false;
      return;
    }
    const step = 1.714;
    this.highlightMesh.position.x = (file - 3.5) * step;
    this.highlightMesh.position.z = (rank - 3.5) * step;
    this.highlightMesh.visible = true;
  }
  private animate(): void {
    try {
      const delta = this.clock.getDelta();
      this.frameId = requestAnimationFrame(() => this.animate());
      this.mixer?.update(delta);
      // O OrbitControls exige o update a cada frame quando enableDamping = true
      if (this.controls) {
        this.controls.update();
      }
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
  // Escuta os cliques diretos no canvas
  @HostListener('click', ['$event'])
  onCanvasClick(event: MouseEvent) {
    if (!this.camera || !this.scene) return;
    // Normaliza as coordenadas do mouse para o Raycaster (-1 a +1)
    const rect = this.rendererContainer.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    // Calcula as interseções (true indica para checar todos os filhos recursivamente)
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    if (intersects.length > 0) {
      const hit = intersects[0];
      this.objectClicked.emit({
        meshName: hit.object.name,
        point: hit.point,
        objectPosition: hit.object.position.clone()
      });
    }
  }
  private highlightMesh?: Mesh;/*  */
}