import { AfterViewInit, Component, ElementRef, HostListener, Input, NgZone, OnDestroy, Optional, ViewChild, Output, EventEmitter } from '@angular/core';
import { AnimationMixer, Mesh, PerspectiveCamera, PointLight, Scene, WebGLRenderer, Clock, Raycaster, Vector2, Vector3, PlaneGeometry, MeshBasicMaterial, DoubleSide } from 'three';
import { CoreModule } from '@ci/core';
import { OrbitControls } from 'three/addons';
import { Objeto } from '../engine/objeto';
import { Player } from '@ci/espazio';
import { WebGLPathTracer } from 'three-gpu-pathtracer';
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
  private pathTracer!: WebGLPathTracer;
  private pointerDownPosition = new Vector2();
  @Input() mixer?: AnimationMixer;
  @Input() scene!: Scene;
  private uiScene!: Scene; // Nova cena exclusiva para elementos de UI/Highlight
  @Input() camera?: PerspectiveCamera;
  @Input() renderer?: WebGLRenderer;
  @Input() resizeObserver?: ResizeObserver;
  @Input() frameId: number = 0;
  @Output() objectClicked = new EventEmitter<ThreeClickEvent>();
  lights: PointLight[] = [];
  clock = new Clock();
  controls?: OrbitControls;
  private raycaster = new Raycaster();
  private mouse = new Vector2();
  private highlightMesh?: Mesh;
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
    // Intercepta apenas os objetos da cena principal (o highlight já não está aqui, o que evita bugs)
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    const hit = intersects[0];
    if (hit) {
      const worldPos = new Vector3();
      hit.object.getWorldPosition(worldPos);
      this.objectClicked.emit({
        meshName: hit.object.name,
        point: hit.point,
        objectPosition: worldPos
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
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.pathTracer) this.pathTracer.dispose();
    cancelAnimationFrame(this.frameId);
    if (this.controls) this.controls.dispose();
    if (this.renderer) this.renderer.dispose();
  }
  private initThree(): void {
    this.scene = new Scene();
    this.uiScene = new Scene(); // Inicializa a cena de UI
    const { clientWidth, clientHeight } = this.rendererContainer.nativeElement;
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'highp'
    });
    // CRÍTICO: Impede que a renderização da uiScene apague o resultado do PathTracer
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = false;
    this.renderer.setSize(clientWidth, clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.pathTracer = new WebGLPathTracer(this.renderer);
    this.pathTracer.fadeDuration = 0;
    this.pathTracer.enablePathTracing = true;
    this.pathTracer.dynamicLowRes = true;
    this.pathTracer.minSamples = 0;
    this.pathTracer.renderScale = 0.7;
    //  this.pathTracer.filterGlossyFactor = 0.5;
    this.pathTracer.multipleImportanceSampling = true;
    // this.pathTracer.bounces = 5;
    if (this.camera) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.enablePan = false;
      this.controls.enableZoom = true;
      this.controls.addEventListener('change', () => {
        this.pathTracer.updateCamera();
      });
    }
    /* const light = new PointLight(0xffffff, 10, 100);
    this.lights.push(light);
    light.position.set(0, 40, -10);
    this.scene.add(light); */
    // Malha de Highlight adicionada à UISCENE em vez da SCENE principal
    const geometry = new PlaneGeometry(1.65, 1.65);
    const material = new MeshBasicMaterial({
      color: 0x7b61ff,
      transparent: true,
      opacity: 0.6,
      side: DoubleSide,
      depthTest: false // Garante que o highlight não seja escondido pelo tabuleiro renderizado
    });
    this.highlightMesh = new Mesh(geometry, material);
    this.highlightMesh.rotation.x = -Math.PI / 2;
    this.highlightMesh.position.y = 1.33;
    this.highlightMesh.visible = false;
    this.uiScene.add(this.highlightMesh);
    if (this.objetos) {
      const loadPromises = this.objetos.map(async obj => {
        obj.scene = this.scene;
        if (!!obj.glb_file) {
          if (typeof obj.loadGBLFile === 'function') {
            await obj.loadGBLFile();
          }
          if (!this.mixer && obj.scene) this.mixer = new AnimationMixer(obj.scene);
          if (!!obj?.gltf?.animations && Array.isArray(obj.gltf.animations)) {
            obj.animations = obj.gltf.animations.map(x => this.mixer!.clipAction(x));
          }
        }
      });
      Promise.all(loadPromises).then(() => {
        // Usa a versão síncrona uma única vez no carregamento. 
        // Isso evita completamente o erro de Worker do Angular.
        this.pathTracer.setScene(this.scene, this.camera!);
        this.pathTracer.updateCamera();
      });
    }
  }
  public setHighlight(rank: number | null, file: number | null) {
    if (!this.highlightMesh) return;
    if (rank === null || file === null) {
      this.highlightMesh.visible = false;
    } else {
      const step = 1.714;
      this.highlightMesh.position.x = (file - 3.5) * step;
      this.highlightMesh.position.z = (rank - 3.5) * step;
      this.highlightMesh.visible = true;
    }
    // NENHUMA ATUALIZAÇÃO DO PATHTRACER AQUI. 
    // O highlight se move instantaneamente sem afetar o Raytracing!
  }
  private animate(): void {
    try {
      const delta = this.clock.getDelta();
      this.frameId = requestAnimationFrame(() => this.animate());
      if (this.mixer) {
        this.mixer.update(delta);
      }
      if (this.controls) {
        this.controls.update();
      }
      if (this.scene && this.camera && this.renderer && this.pathTracer) {
        // Renderiza a amostra do Path Tracer continuamente para acumular os cálculos de luz
        this.pathTracer.renderSample();
        // Limpa o buffer de profundidade e renderiza a UI por cima
        this.renderer.clearDepth();
        this.renderer.render(this.uiScene, this.camera);
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
    if (this.pathTracer) {
      this.pathTracer.updateCamera();
    }
  }
  // Adicione estas variáveis de controle junto às outras propriedades da classe
  private isAnimatingPiece = false;
  private isRebuildingBVH = false;
  // Método chamado para iniciar o movimento da peça
  public iniciarAnimacaoMovimento() {
    this.isAnimatingPiece = true;
  }
  // Método chamado quando a peça termina de se mover
  public finalizarAnimacaoMovimento() {
    this.isAnimatingPiece = false;
    // 1. Atualiza as matrizes no mundo 3D
    this.scene.updateMatrixWorld(true);
    if (this.pathTracer && this.camera) {
      try {
        this.pathTracer.setScene(this.scene, this.camera);
        this.pathTracer.updateCamera();
      } catch (e) {
        console.error("Erro ao atualizar o Path Tracer:", e);
      }
    }
  }
}