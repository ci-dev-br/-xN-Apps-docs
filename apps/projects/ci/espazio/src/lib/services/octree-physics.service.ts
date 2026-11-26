import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';
import { Capsule } from 'three/addons/math/Capsule.js';
import { PhysicsSphere, WorldConfig } from '../models/ez-physics.types';

@Injectable()
export class OctreePhysicsService {
    private worldOctree = new Octree();
    private octreeHelper?: OctreeHelper;

    private playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);
    private playerVelocity = new THREE.Vector3();
    private playerDirection = new THREE.Vector3();
    private playerOnFloor = false;

    private spheres: PhysicsSphere[] = [];
    private sphereIdx = 0;

    // Vetores reutilizáveis para evitar Garbage Collection no loop
    private readonly vector1 = new THREE.Vector3();
    private readonly vector2 = new THREE.Vector3();
    private readonly vector3 = new THREE.Vector3();

    private config!: WorldConfig;
    private camera!: THREE.PerspectiveCamera;

    public init(scene: THREE.Scene, camera: THREE.PerspectiveCamera, config: WorldConfig): void {
        this.camera = camera;
        this.config = config;
        this.initSpheres(scene);
        this.loadWorld(scene, config.modelUrl);
    }

    private initSpheres(scene: THREE.Scene): void {
        const geometry = new THREE.IcosahedronGeometry(this.config.sphereRadius, 5);
        const material = new THREE.MeshLambertMaterial({ color: 0xdede8d });

        for (let i = 0; i < this.config.numSpheres; i++) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);

            this.spheres.push({
                mesh,
                collider: new THREE.Sphere(new THREE.Vector3(0, -100, 0), this.config.sphereRadius),
                velocity: new THREE.Vector3()
            });
        }
    }

    private loadWorld(scene: THREE.Scene, modelUrl: string): void {
        const loader = new GLTFLoader();
        loader.load(modelUrl, (gltf) => {
            scene.add(gltf.scene);
            this.worldOctree.fromGraphNode(gltf.scene);

            gltf.scene.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    const mat = mesh.material as THREE.MeshStandardMaterial;
                    if (mat.map) {
                        mat.map.anisotropy = 4;
                    }
                }
            });

            this.octreeHelper = new OctreeHelper(this.worldOctree);
            this.octreeHelper.visible = false;
            scene.add(this.octreeHelper);
        });
    }

    public setDebugVisibility(visible: boolean): void {
        if (this.octreeHelper) {
            this.octreeHelper.visible = visible;
        }
    }

    public throwBall(holdDurationMs: number): void {
        const sphere = this.spheres[this.sphereIdx];
        this.camera.getWorldDirection(this.playerDirection);

        sphere.collider.center
            .copy(this.playerCollider.end)
            .addScaledVector(this.playerDirection, this.playerCollider.radius * 1.5);

        const impulse = 15 + 30 * (1 - Math.exp(-holdDurationMs * 0.001));
        sphere.velocity.copy(this.playerDirection).multiplyScalar(impulse);
        sphere.velocity.addScaledVector(this.playerVelocity, 2);

        this.sphereIdx = (this.sphereIdx + 1) % this.spheres.length;
    }

    public step(frameDelta: number, keyStates: Record<string, boolean>): void {
        const deltaTime = frameDelta / this.config.stepsPerFrame;

        for (let i = 0; i < this.config.stepsPerFrame; i++) {
            this.applyControls(deltaTime, keyStates);
            this.updatePlayer(deltaTime);
            this.updateSpheres(deltaTime);
            this.teleportPlayerIfOob();
        }
    }

    private applyControls(deltaTime: number, keyStates: Record<string, boolean>): void {
        const speedDelta = deltaTime * (this.playerOnFloor ? 25 : 8);

        if (keyStates['KeyW']) this.playerVelocity.add(this.getForwardVector().multiplyScalar(speedDelta));
        if (keyStates['KeyS']) this.playerVelocity.add(this.getForwardVector().multiplyScalar(-speedDelta));
        if (keyStates['KeyA']) this.playerVelocity.add(this.getSideVector().multiplyScalar(-speedDelta));
        if (keyStates['KeyD']) this.playerVelocity.add(this.getSideVector().multiplyScalar(speedDelta));

        if (this.playerOnFloor && keyStates['Space']) {
            this.playerVelocity.y = 15;
        }
    }

    private updatePlayer(deltaTime: number): void {
        let damping = Math.exp(-4 * deltaTime) - 1;

        if (!this.playerOnFloor) {
            this.playerVelocity.y -= this.config.gravity * deltaTime;
            damping *= 0.1;
        }

        this.playerVelocity.addScaledVector(this.playerVelocity, damping);
        const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);
        this.playerCollider.translate(deltaPosition);

        const result = this.worldOctree.capsuleIntersect(this.playerCollider);
        this.playerOnFloor = false;

        if (result) {
            this.playerOnFloor = result.normal.y > 0;
            if (!this.playerOnFloor) {
                this.playerVelocity.addScaledVector(result.normal, -result.normal.dot(this.playerVelocity));
            }
            if (result.depth >= 1e-10) {
                this.playerCollider.translate(result.normal.multiplyScalar(result.depth));
            }
        }

        this.camera.position.copy(this.playerCollider.end);
    }

    private updateSpheres(deltaTime: number): void {
        for (const sphere of this.spheres) {
            sphere.collider.center.addScaledVector(sphere.velocity, deltaTime);
            const result = this.worldOctree.sphereIntersect(sphere.collider);

            if (result) {
                sphere.velocity.addScaledVector(result.normal, -result.normal.dot(sphere.velocity) * 1.5);
                sphere.collider.center.add(result.normal.multiplyScalar(result.depth));
            } else {
                sphere.velocity.y -= this.config.gravity * deltaTime;
            }

            const damping = Math.exp(-1.5 * deltaTime) - 1;
            sphere.velocity.addScaledVector(sphere.velocity, damping);
            this.playerSphereCollision(sphere);
        }

        this.spheresCollisions();

        for (const sphere of this.spheres) {
            sphere.mesh.position.copy(sphere.collider.center);
        }
    }

    private playerSphereCollision(sphere: PhysicsSphere): void {
        const center = this.vector1.addVectors(this.playerCollider.start, this.playerCollider.end).multiplyScalar(0.5);
        const sphereCenter = sphere.collider.center;
        const r = this.playerCollider.radius + sphere.collider.radius;
        const r2 = r * r;

        for (const point of [this.playerCollider.start, this.playerCollider.end, center]) {
            const d2 = point.distanceToSquared(sphereCenter);
            if (d2 < r2) {
                const normal = this.vector1.subVectors(point, sphereCenter).normalize();
                const v1 = this.vector2.copy(normal).multiplyScalar(normal.dot(this.playerVelocity));
                const v2 = this.vector3.copy(normal).multiplyScalar(normal.dot(sphere.velocity));

                this.playerVelocity.add(v2).sub(v1);
                sphere.velocity.add(v1).sub(v2);

                const d = (r - Math.sqrt(d2)) / 2;
                sphereCenter.addScaledVector(normal, -d);
            }
        }
    }

    private spheresCollisions(): void {
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
                    s2.collider.center.addScaledVector(normal, -d);
                }
            }
        }
    }

    private getForwardVector(): THREE.Vector3 {
        this.camera.getWorldDirection(this.playerDirection);
        this.playerDirection.y = 0;
        this.playerDirection.normalize();
        return this.playerDirection;
    }

    private getSideVector(): THREE.Vector3 {
        this.camera.getWorldDirection(this.playerDirection);
        this.playerDirection.y = 0;
        this.playerDirection.normalize();
        this.playerDirection.cross(this.camera.up);
        return this.playerDirection;
    }

    private teleportPlayerIfOob(): void {
        if (this.camera.position.y <= -25) {
            this.playerCollider.start.set(0, 0.35, 0);
            this.playerCollider.end.set(0, 1, 0);
            this.playerCollider.radius = 0.35;
            this.camera.position.copy(this.playerCollider.end);
            this.camera.rotation.set(0, 0, 0);
        }
    }
}