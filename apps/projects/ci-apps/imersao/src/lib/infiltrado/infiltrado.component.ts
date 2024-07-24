import { Component, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { VRButton, GLTFLoader, Octree, OctreeHelper, Capsule } from 'three/addons';
import { GUI } from 'lil-gui';
@Component({
  selector: 'ci-infiltrado',
  standalone: true,
  imports: [],
  templateUrl: './infiltrado.component.html',
  styleUrl: './infiltrado.component.scss'
})
export class InfiltradoComponent {
  private GRAVITY?: any;
  private NUM_SPHERES?: any;
  private SPHERE_RADIUS?: any;
  private STEPS_PER_FRAME?: any;
  private sphereGeometry?: any;
  private sphereMaterial?: THREE.MeshLambertMaterial;
  private spheres?: any[];
  private clock?: any;
  private scene?: any;
  private camera?: any;
  private directionalLight?: any;
  private fillLight1?: any;
  private renderer?: any;
  private stats?: Stats;
  private keyStates?: any;
  private worldOctree?: any;
  private playerCollider?: any;
  private vector1?: any;
  private vector2?: any;
  private vector3?: any;
  private sphereIdx?: any;
  private playerDirection?: any;
  private playerVelocity?: any;
  private mouseTime?: any;
  private playerOnFloor?: any;
  private loader?: any;

  @ViewChild('container') container?: ElementRef<HTMLElement>;

  constructor(
  ) {
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x88ccee);
    this.scene.fog = new THREE.Fog(0x88ccee, 0, 50);
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.rotation.order = 'YXZ';
    this.fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
    this.fillLight1.position.set(2, 1, 1);
    this.scene.add(this.fillLight1);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    this.directionalLight.position.set(- 5, 25, - 1);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.camera.near = 0.01;
    this.directionalLight.shadow.camera.far = 500;
    this.directionalLight.shadow.camera.right = 30;
    this.directionalLight.shadow.camera.left = - 30;
    this.directionalLight.shadow.camera.top = 30;
    this.directionalLight.shadow.camera.bottom = - 30;
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.radius = 4;
    this.directionalLight.shadow.bias = - 0.00006;
    this.scene.add(this.directionalLight);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setAnimationLoop(this.animate);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container?.nativeElement.appendChild(this.renderer.domElement);
    this.stats = new Stats();
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.top = '0px';
    this.container?.nativeElement.appendChild(this.stats.dom);
    this.GRAVITY = 30;
    this.NUM_SPHERES = 100;
    this.SPHERE_RADIUS = 0.2;
    this.STEPS_PER_FRAME = 5;
    this.sphereGeometry = new THREE.IcosahedronGeometry(this.SPHERE_RADIUS, 5);
    this.sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xdede8d });
    this.spheres = [];
    let sphereIdx = 0;
    for (let i = 0; i < this.NUM_SPHERES; i++) {
      const sphere = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      this.scene.add(sphere);
      this.spheres.push({
        mesh: sphere,
        collider: new THREE.Sphere(new THREE.Vector3(0, - 100, 0), this.SPHERE_RADIUS),
        velocity: new THREE.Vector3()
      });
    }
    this.worldOctree = new Octree();
    this.playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);
    this.playerVelocity = new THREE.Vector3();
    this.playerDirection = new THREE.Vector3();
    let playerOnFloor = false;
    let mouseTime = 0;
    this.keyStates = {};
    this.vector1 = new THREE.Vector3();
    this.vector2 = new THREE.Vector3();
    this.vector3 = new THREE.Vector3();
    document.addEventListener('keydown', (event) => {
      this.keyStates[event.code] = true;
    });
    document.addEventListener('keyup', (event) => {
      this.keyStates[event.code] = false;
    });
    this.container?.nativeElement.addEventListener('mousedown', () => {
      document.body.requestPointerLock();
      mouseTime = performance.now();
    });
    document.addEventListener('mouseup', () => {
      if (document.pointerLockElement !== null) this.throwBall();
    });
    document.body.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement === document.body) {
        this.camera.rotation.y -= event.movementX / 500;
        this.camera.rotation.x -= event.movementY / 500;
      }
    });
    window.addEventListener('resize', this.onWindowResize);

    this.loader = new GLTFLoader().setPath('./models/gltf/');
    this.loader.load('collision-world.glb', (gltf: any) => {
      this.scene.add(gltf.scene);
      this.worldOctree.fromGraphNode(gltf.scene);
      gltf.scene.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material.map) {
            child.material.map.anisotropy = 4;
          }
        }
      });
      const helper = new OctreeHelper(this.worldOctree);
      helper.visible = false;
      this.scene.add(helper);
      const gui = new GUI({ width: 200 });
      gui.add({ debug: false }, 'debug')
        .onChange((value: any) => {
          helper.visible = value;
        });
    });
  }
  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  private throwBall() {
    if (!this.spheres) return;
    const sphere = (this.spheres || [])[this.sphereIdx];
    this.camera.getWorldDirection(this.playerDirection);
    sphere.collider.center.copy(this.playerCollider.end).addScaledVector(this.playerDirection, this.playerCollider.radius * 1.5);
    // throw the ball with more force if we hold the button longer, and if we move forward
    const impulse = 15 + 30 * (1 - Math.exp((this.mouseTime - performance.now()) * 0.001));
    sphere.velocity.copy(this.playerDirection).multiplyScalar(impulse);
    sphere.velocity.addScaledVector(this.playerVelocity, 2);
    this.sphereIdx = (this.sphereIdx + 1) % this.spheres.length;
  }
  private playerCollisions() {
    const result = this.worldOctree.capsuleIntersect(this.playerCollider);
    this.playerOnFloor = false;
    if (result) {
      this.playerOnFloor = result.normal.y > 0;
      if (!this.playerOnFloor) {
        this.playerVelocity.addScaledVector(result.normal, - result.normal.dot(this.playerVelocity));
      }
      if (result.depth >= 1e-10) {
        this.playerCollider.translate(result.normal.multiplyScalar(result.depth));
      }
    }
  }
  private updatePlayer(deltaTime: number) {
    let damping = Math.exp(- 4 * deltaTime) - 1;
    if (!this.playerOnFloor) {
      this.playerVelocity.y -= this.GRAVITY * deltaTime;
      // small air resistance
      damping *= 0.1;
    }
    this.playerVelocity.addScaledVector(this.playerVelocity, damping);
    const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);
    this.playerCollider.translate(deltaPosition);
    this.playerCollisions();
    this.camera.position.copy(this.playerCollider.end);
  }
  private playerSphereCollision(sphere: any) {
    const center = this.vector1.addVectors(this.playerCollider.start, this.playerCollider.end).multiplyScalar(0.5);
    const sphere_center = sphere.collider.center;
    const r = this.playerCollider.radius + sphere.collider.radius;
    const r2 = r * r;
    // approximation: player = 3 spheres
    for (const point of [this.playerCollider.start, this.playerCollider.end, center]) {
      const d2 = point.distanceToSquared(sphere_center);
      if (d2 < r2) {
        const normal = this.vector1.subVectors(point, sphere_center).normalize();
        const v1 = this.vector2.copy(normal).multiplyScalar(normal.dot(this.playerVelocity));
        const v2 = this.vector3.copy(normal).multiplyScalar(normal.dot(sphere.velocity));
        this.playerVelocity.add(v2).sub(v1);
        sphere.velocity.add(v1).sub(v2);
        const d = (r - Math.sqrt(d2)) / 2;
        sphere_center.addScaledVector(normal, - d);
      }
    }
  }
  private spheresCollisions() {
    if (this.spheres)
      for (let i = 0, length = this.spheres.length; i < length; i++) {
        const s1 = this.spheres[i];
        for (let j = i + 1; j < length; j++) {
          const s2 = this.spheres[j];
          const d2 = s1.collider.center.distanceToSquared(s2.collider.center);
          const r = s1.collider.radius + s2.collider.radius;
          const r2 = r * r;
          if (d2 < r2) {
            const normal = this.vector1.subVectors(s1.collider.center, s2.collider.center).normalize();
            const v1 = this.vector2.copy(normal).multiplyScalar(normal.dot(s1.velocity));
            const v2 = this.vector3.copy(normal).multiplyScalar(normal.dot(s2.velocity));
            s1.velocity.add(v2).sub(v1);
            s2.velocity.add(v1).sub(v2);
            const d = (r - Math.sqrt(d2)) / 2;
            s1.collider.center.addScaledVector(normal, d);
            s2.collider.center.addScaledVector(normal, - d);
          }
        }
      }
  }
  private updateSpheres(deltaTime: number) {
    if (this.spheres)
      this.spheres.forEach(sphere => {
        sphere.collider.center.addScaledVector(sphere.velocity, deltaTime);
        const result = this.worldOctree.sphereIntersect(sphere.collider);
        if (result) {
          sphere.velocity.addScaledVector(result.normal, - result.normal.dot(sphere.velocity) * 1.5);
          sphere.collider.center.add(result.normal.multiplyScalar(result.depth));
        } else {
          sphere.velocity.y -= this.GRAVITY * deltaTime;
        }
        const damping = Math.exp(- 1.5 * deltaTime) - 1;
        sphere.velocity.addScaledVector(sphere.velocity, damping);
        this.playerSphereCollision(sphere);
      });
    this.spheresCollisions();
    if (this.spheres)
      for (const sphere of this.spheres) {
        sphere.mesh.position.copy(sphere.collider.center);
      }
  }
  private getForwardVector() {
    this.camera.getWorldDirection(this.playerDirection);
    this.playerDirection.y = 0;
    this.playerDirection.normalize();
    return this.playerDirection;
  }
  private getSideVector() {
    this.camera.getWorldDirection(this.playerDirection);
    this.playerDirection.y = 0;
    this.playerDirection.normalize();
    this.playerDirection.cross(this.camera.up);
    return this.playerDirection;
  }
  private controls(deltaTime: number) {
    // gives a bit of air control
    const speedDelta = deltaTime * (this.playerOnFloor ? 25 : 8);
    if (this.keyStates['KeyW']) {
      this.playerVelocity.add(this.getForwardVector().multiplyScalar(speedDelta));
    }
    if (this.keyStates['KeyS']) {
      this.playerVelocity.add(this.getForwardVector().multiplyScalar(- speedDelta));
    }
    if (this.keyStates['KeyA']) {
      this.playerVelocity.add(this.getSideVector().multiplyScalar(- speedDelta));
    }
    if (this.keyStates['KeyD']) {
      this.playerVelocity.add(this.getSideVector().multiplyScalar(speedDelta));
    }
    if (this.playerOnFloor) {
      if (this.keyStates['Space']) {
        this.playerVelocity.y = 15;
      }
    }
  }
  private teleportPlayerIfOob() {
    if (this.camera.position.y <= - 25) {
      this.playerCollider.start.set(0, 0.35, 0);
      this.playerCollider.end.set(0, 1, 0);
      this.playerCollider.radius = 0.35;
      this.camera.position.copy(this.playerCollider.end);
      this.camera.rotation.set(0, 0, 0);
    }
  }
  private animate() {
    const deltaTime = Math.min(0.05, this.clock.getDelta()) / this.STEPS_PER_FRAME;
    // we look for collisions in substeps to mitigate the risk of
    // an object traversing another too quickly for detection.
    for (let i = 0; i < this.STEPS_PER_FRAME; i++) {
      this.controls(deltaTime);
      this.updatePlayer(deltaTime);
      this.updateSpheres(deltaTime);
      this.teleportPlayerIfOob();
    }
    this.renderer.render(this.scene, this.camera);
    this.stats?.update();
  }
}
