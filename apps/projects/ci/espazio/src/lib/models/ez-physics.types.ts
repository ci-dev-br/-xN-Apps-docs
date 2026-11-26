import * as THREE from 'three';

export interface PhysicsSphere {
    mesh: THREE.Mesh;
    collider: THREE.Sphere;
    velocity: THREE.Vector3;
}

export interface WorldConfig {
    modelUrl: string;
    gravity: number;
    numSpheres: number;
    sphereRadius: number;
    stepsPerFrame: number;
}