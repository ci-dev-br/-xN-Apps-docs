import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';

@Injectable()
export class ThreeEngineService implements OnDestroy {
  private ngZone = inject(NgZone);

  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  public clock = new THREE.Clock();
  private stats?: Stats;
  private resizeObserver?: ResizeObserver;

  public init(container: HTMLElement, showStats = true): void {
    // Cena e Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x88ccee);
    this.scene.fog = new THREE.Fog(0x88ccee, 0, 50);

    // Câmera
    const { clientWidth, clientHeight } = container;
    this.camera = new THREE.PerspectiveCamera(70, clientWidth / clientHeight, 0.1, 1000);
    this.camera.rotation.order = 'YXZ';

    // Iluminação
    this.setupLights();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(clientWidth, clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(this.renderer.domElement);

    // Stats (FPS)
    if (showStats) {
      this.stats = new Stats();
      this.stats.dom.style.position = 'absolute';
      this.stats.dom.style.top = '0px';
      container.appendChild(this.stats.dom);
    }

    // Resize dinâmico baseado no container (permite usar o componente em qualquer tamanho de div)
    this.resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
    this.resizeObserver.observe(container);
  }

  private setupLights(): void {
    const fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
    fillLight1.position.set(2, 1, 1);
    this.scene.add(fillLight1);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(-5, 25, -1);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.01;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.radius = 4;
    directionalLight.shadow.bias = -0.00006;
    this.scene.add(directionalLight);
  }

  public startLoop(onTick: (deltaTime: number) => void): void {
    this.ngZone.runOutsideAngular(() => {
      this.renderer.setAnimationLoop(() => {
        const delta = Math.min(0.05, this.clock.getDelta());
        onTick(delta);
        this.renderer.render(this.scene, this.camera);
        this.stats?.update();
      });
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.renderer?.setAnimationLoop(null);
    this.renderer?.dispose();
    this.stats?.dom.remove();
  }
}