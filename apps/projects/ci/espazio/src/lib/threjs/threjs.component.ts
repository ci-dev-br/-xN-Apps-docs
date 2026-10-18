import { AfterViewInit, Component, ElementRef, HostListener, Input, NgZone, OnDestroy, Optional, ViewChild, Output, EventEmitter } from '@angular/core';
import { AnimationMixer, Mesh, PerspectiveCamera, PointLight, Scene, WebGLRenderer, Clock, Raycaster, Vector2, Vector3, PlaneGeometry, MeshBasicMaterial, DoubleSide, AmbientLight } from 'three';
import { CoreModule } from '@ci/core';
import { OrbitControls, VRButton } from 'three/addons';
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
  private uiScene!: Scene;
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
  private vrButtonElement?: HTMLElement;
  // ESTADO DO RAY TRACING: Inicia como desligado
  public isPathTracingEnabled: boolean = false;
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
      this.renderer?.setAnimationLoop(() => this.animate());
    });
  }
  ngOnDestroy(): void {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.pathTracer) this.pathTracer.dispose();
    if (this.renderer) {
      this.renderer.setAnimationLoop(null);
      this.renderer.dispose();
    }
    if (this.vrButtonElement) this.vrButtonElement.remove();
    if (this.controls) this.controls.dispose();
  }
  private initThree(): void {
    this.scene = new Scene();
    this.uiScene = new Scene();
    const { clientWidth, clientHeight } = this.rendererContainer.nativeElement;
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      // powerPreference: 'high-performance',
      // precision: 'highp'
    });
    this.renderer.xr.enabled = true;
    // IMPORTANTE: Como usamos autoClear = false, gerenciaremos as limpezas no animate()
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = false;
    this.renderer.setSize(clientWidth, clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.vrButtonElement = VRButton.createButton(this.renderer);
    this.rendererContainer.nativeElement.appendChild(this.vrButtonElement);
    this.pathTracer = new WebGLPathTracer(this.renderer);
    this.pathTracer.enablePathTracing = true;
    this.pathTracer.minSamples = 1;
    this.pathTracer.renderScale = 1;
    this.pathTracer.filterGlossyFactor = 0.5;
    this.pathTracer.multipleImportanceSampling = true;
    this.pathTracer.bounces = 5;
    if (this.camera) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.enablePan = false;
      this.controls.enableZoom = true;
      this.controls.addEventListener('change', () => {
        if (this.isPathTracingEnabled) this.pathTracer.updateCamera();
      });
    }
    // LUZES PARA MODO STANDARD (Ray Tracing Desligado)
    // Descomentei e adicionei luz ambiente para que no modo normal não fique tudo escuro
    const light = new PointLight(0xffffff, 10, 100);
    this.lights.push(light);
    light.position.set(0, 40, -10);
    this.scene.add(light);
    const ambientLight = new AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);
    const geometry = new PlaneGeometry(1.65, 1.65);
    const material = new MeshBasicMaterial({
      color: 0x7b61ff,
      transparent: true,
      opacity: 0.6,
      side: DoubleSide,
      depthTest: false
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
        this.pathTracer.setScene(this.scene, this.camera!);
        this.pathTracer.updateCamera();
      });
    }
  }
  // MÉTODO PARA LIGAR/DESLIGAR O RAY TRACING (pode ser chamado via botão no HTML)
  public toggleRayTracing(): void {
    this.isPathTracingEnabled = !this.isPathTracingEnabled;
    // Quando religamos, garantimos que a cena e a câmera estão perfeitamente sincronizadas
    if (this.isPathTracingEnabled && this.pathTracer && this.scene && this.camera) {
      this.pathTracer.setScene(this.scene, this.camera);
      this.pathTracer.updateCamera();
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
  }
  private animate(): void {
    try {
      const delta = this.clock.getDelta();
      if (this.mixer) this.mixer.update(delta);
      if (this.controls) this.controls.update();
      if (this.scene && this.camera && this.renderer) {
        // Verifica se VR está ativo
        const isVRActive = this.renderer.xr.isPresenting;
        // Se Path Tracing habilitado e NÃO estamos no modo VR (VR não suporta o PathTracer nativamente bem)
        if (this.isPathTracingEnabled && this.pathTracer && !isVRActive) {
          this.pathTracer.renderSample();
        } else {
          // RENDERIZAÇÃO PADRÃO DO THREE.JS (Rápida/Ideal para VR e PCs mais fracos)
          this.renderer.clear(); // Necessário pois autoClear está false
          this.renderer.render(this.scene, this.camera);
        }
        // Renderiza a UI (Tabuleiro/Highlights) por cima
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
    // Atualiza projeção apenas se usarmos renderizador padrão também
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, h);
    if (this.pathTracer && this.isPathTracingEnabled) {
      this.pathTracer.updateCamera();
    }
  }
  private isAnimatingPiece = false;
  private isRebuildingBVH = false;
  public iniciarAnimacaoMovimento() {
    this.isAnimatingPiece = true;
  }
  public finalizarAnimacaoMovimento() {
    this.isAnimatingPiece = false;
    // Atualiza o BVH/PathTracer apenas se o ray tracing estiver ligado
    if (this.isPathTracingEnabled && this.pathTracer && this.camera) {
      try {
        this.pathTracer.setScene(this.scene, this.camera);
        this.pathTracer.updateCamera();
      } catch (e) {
        console.error("Erro ao atualizar o Path Tracer:", e);
      }
    }
  }
}