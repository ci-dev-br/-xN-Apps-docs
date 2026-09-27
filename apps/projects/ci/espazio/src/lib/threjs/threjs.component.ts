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
  // Nova variável para o Ray Tracer
  private pathTracer!: WebGLPathTracer;
  private pointerDownPosition = new Vector2();
  @Input() mixer?: AnimationMixer;
  @Input() scene!: Scene;
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

    // Ignora a malha roxa do highlight para não bloquear cliques na mesma casa
    const hit = intersects.find(i => i.object !== this.highlightMesh);

    if (hit) {
      const worldPos = new Vector3();
      hit.object.getWorldPosition(worldPos);

      // --- LOGS DE DEPURAÇÃO ---
      console.log('--- NOVO CLIQUE 3D ---');
      console.log(`1. Malha atingida: "${hit.object.name}"`);
      console.log(`2. Ponto de impacto do rato: X=${hit.point.x.toFixed(3)}, Z=${hit.point.z.toFixed(3)}`);
      console.log(`3. Centro global da peça (WorldPos): X=${worldPos.x.toFixed(3)}, Z=${worldPos.z.toFixed(3)}`);
      console.log('----------------------');

      this.objectClicked.emit({
        meshName: hit.object.name,
        point: hit.point,
        objectPosition: worldPos
      });
    } else {
      console.warn('Raycaster não intercetou nenhum objeto válido.');
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
    if (this.pathTracer) {
      this.pathTracer.dispose();
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
      alpha: true, // O path tracer suporta fundo transparente
      powerPreference: 'high-performance',
      precision: 'highp'
    });

    // O Path Tracer não usa o shadowMap padrão, pode remover/desativar
    this.renderer.shadowMap.enabled = false;
    this.renderer.setSize(clientWidth, clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // 1. Inicializar o Path Tracer
    this.pathTracer = new WebGLPathTracer(this.renderer);
    this.pathTracer.setScene(this.scene, this.camera!);

    if (this.camera) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.enablePan = false;
      this.controls.enableZoom = true;

      // 2. Reiniciar o acúmulo de raios sempre que a câmera se mover
      this.controls.addEventListener('change', () => {
        this.pathTracer.updateCamera();
      });
    }

    // Luzes padrão perdem um pouco o sentido no raytracing puro sem geometria, 
    // mas você pode mantê-las se usar MeshPhysicalMaterial configurado.
    const light = new PointLight(0xffffff, 10, 100);
    this.lights.push(light);
    light.position.set(0, 40, -10);
    this.scene.add(light);

    // Malha de Highlight (inalterada)
    const geometry = new PlaneGeometry(1.65, 1.65);
    const material = new MeshBasicMaterial({
      color: 0x7b61ff,
      transparent: true,
      opacity: 0.6,
      side: DoubleSide,
      depthWrite: true
    });
    this.highlightMesh = new Mesh(geometry, material);
    this.highlightMesh.rotation.x = -Math.PI / 2;
    this.highlightMesh.position.y = 1.33;
    this.highlightMesh.visible = false;
    this.scene.add(this.highlightMesh);

    // 3. Carregar Objetos e Atualizar o BVH (Árvore de colisão para o Raytracer)
    if (this.objetos) {
      // Usamos Promise.all para esperar todos os GLBs carregarem
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
        // Após todas as peças (como o tabuleiro de xadrez) carregarem, atualizamos a cena no ray tracer
        // Isso gera a estrutura BVH necessária para o ray tracing funcionar.
        this.pathTracer.setScene(this.scene, this.camera!);
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

      let needsUpdate = false;
      if (this.controls) {
        this.controls.update(); // Dispara o 'change' se houver movimento (damping)
      }

      // Se houver animação de peças acontecendo, você precisa dizer ao path tracer para atualizar
      // Exemplo: if (isAnimating) this.pathTracer.updateScene();

      if (this.scene && this.camera && this.renderer) {
        // 4. Substituir renderer.render por pathTracer.renderSample()
        // Ele vai acumular luz a cada frame. Quando a câmera para, a imagem fica perfeitamente nítida.
        this.pathTracer.renderSample();
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
    // Atualiza as dimensões no Path Tracer
    if (this.pathTracer) {
      this.pathTracer.updateCamera();
    }
  }
  private highlightMesh?: Mesh;/*  */
}