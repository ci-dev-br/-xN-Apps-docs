import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { VRButton } from 'three/addons';
@Component({
  selector: 'ci-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  @ViewChild('video') video?: ElementRef<HTMLVideoElement>;
  @ViewChild('container') container?: ElementRef<HTMLElement>;
  @ViewChild('info') info?: ElementRef<HTMLElement>;
  camera?: any;
  scene?: any;
  renderer?: THREE.WebGLRenderer;
  ngOnInit(): void {
    setTimeout(() => {
      this.init();
    })
  }
  init() {
    if (!this.container?.nativeElement || !this.video?.nativeElement) return
    const container = this.container?.nativeElement //  document.getElementById('container');
    container.addEventListener('click', () => {
      this.video?.nativeElement.play();
    });
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 2000);
    this.camera.layers.enable(1); // render left view when no stereo available
    // video
    if (!this.video?.nativeElement) return
    const video = this.video?.nativeElement;
    video.play();
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x101010);
    // left
    const geometry1 = new THREE.SphereGeometry(500, 60, 40);
    // invert the geometry on the x-axis so that all of the faces point inward
    geometry1.scale(- 1, 1, 1);
    const uvs1 = geometry1.attributes['uv'].array;
    for (let i = 0; i < uvs1.length; i += 2) {
      uvs1[i] *= 0.5;
    }
    const material1 = new THREE.MeshBasicMaterial({ map: texture });
    const mesh1 = new THREE.Mesh(geometry1, material1);
    mesh1.rotation.y = - Math.PI / 2;
    mesh1.layers.set(1); // display in left eye only
    this.scene.add(mesh1);
    // right
    const geometry2 = new THREE.SphereGeometry(500, 60, 40);
    geometry2.scale(- 1, 1, 1);
    const uvs2 = geometry2.attributes['uv'].array;
    for (let i = 0; i < uvs2.length; i += 2) {
      uvs2[i] *= 0.5;
      uvs2[i] += 0.5;
    }
    const material2 = new THREE.MeshBasicMaterial({ map: texture });
    const mesh2 = new THREE.Mesh(geometry2, material2);
    mesh2.rotation.y = - Math.PI / 2;
    mesh2.layers.set(2);
    this.scene.add(mesh2);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setAnimationLoop(() => { this.animate() });
    this.renderer.xr.enabled = true;
    this.renderer.xr.setReferenceSpaceType('local');
    container?.appendChild(this.renderer.domElement);
    document.body.appendChild(VRButton.createButton(this.renderer));
    window.addEventListener('resize', () => { this.onWindowResize() });
  }
  animate() {
    this.renderer?.render(this.scene, this.camera);
  }
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer?.setSize(window.innerWidth, window.innerHeight);
  }
}
