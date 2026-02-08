import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, Optional, ViewChild } from '@angular/core';
import { BoxGeometry, Color, Material, Mesh, MeshNormalMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { CoreModule } from '@ci/core';
@Component({
  selector: 'c-threjs',
  imports: [
    CoreModule,
  ],
  standalone: true,
  templateUrl: './threjs.component.html',
  styleUrl: './threjs.component.scss',
})
export class ThrejsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef<HTMLDivElement>;
  protected scene?: Scene;
  protected camera?: PerspectiveCamera;
  protected renderer?: WebGLRenderer;
  protected cube?: Mesh;
  protected resizeObserver?: ResizeObserver;
  protected frameId: number = 0;
  constructor(
    @Optional() private readonly ngZone?: NgZone,
  ) { }
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

    // Descartar geometrias e materiais
    if (this.cube) {
      this.cube.geometry.dispose();
      if (Array.isArray(this.cube.material)) {
        this.cube.material.forEach(m => m.dispose());
      } else {
        (this.cube.material as Material).dispose();
      }
    }

    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThree(): void {
    // 1. Scene
    this.scene = new Scene();
    this.scene.background = new Color(0x222222); // Cinza escuro para contraste

    // 2. Camera (Dimensões iniciais temporárias, serão corrigidas pelo ResizeObserver)
    const { clientWidth, clientHeight } = this.rendererContainer.nativeElement;
    this.camera = new PerspectiveCamera(75, clientWidth / clientHeight, 0.1, 1000);
    this.camera.position.z = 5;

    // 3. Renderer
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(clientWidth, clientHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // 4. Objeto de Exemplo (Cubo)
    const geometry = new BoxGeometry();
    const material = new MeshNormalMaterial(); // Material colorido básico
    this.cube = new Mesh(geometry, material);
    this.scene.add(this.cube);
  }

  private animate(): void {
    this.frameId = requestAnimationFrame(() => this.animate());

    // Lógica de animação
    if (this.cube) {
      this.cube.rotation.x += 0.01;
      this.cube.rotation.y += 0.01;
    }

    if (this.scene && this.camera && this.renderer)
      this.renderer.render(this.scene, this.camera);
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Pega as novas dimensões do container pai
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;

        this.updateDimensions(width, height);
      }
    });

    this.resizeObserver.observe(this.rendererContainer.nativeElement);
  }

  private updateDimensions(width: number, height: number): void {
    if (!this.camera || !this.renderer) return;

    // Evita altura 0 que pode quebrar a câmera
    const h = height > 0 ? height : 1;

    this.camera.aspect = width / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, h);
  }
}