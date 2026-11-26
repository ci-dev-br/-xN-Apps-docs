import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    Input,
    OnDestroy,
    ViewChild,
    inject
} from '@angular/core';
import { HudOverlayComponent } from '../hud-overlay/hud-overlay.component';
import { ThreeEngineService } from '../services/three-engine.service';
import { OctreePhysicsService } from '../services/octree-physics.service';

@Component({
    selector: 'ci-fps-world',
    standalone: true,
    imports: [HudOverlayComponent],
    providers: [ThreeEngineService, OctreePhysicsService],
    template: `
    <section
      #canvasContainer
      class="viewport-container"
      (mousedown)="onContainerMouseDown()"
    >
      @if (showHud) {
        <ci-hud-overlay
          [debugMode]="debugOctree"
          (debugModeChange)="toggleOctreeDebug($event)"
        />
      }
    </section>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .viewport-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      cursor: crosshair;
    }
  `]
})
export class FpsWorldComponent implements AfterViewInit, OnDestroy {
    @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef<HTMLElement>;

    @Input() modelUrl = 'models/gltf/collision-world.glb';
    @Input() gravity = 30;
    @Input() numSpheres = 100;
    @Input() sphereRadius = 0.2;
    @Input() stepsPerFrame = 5;
    @Input() showStats = true;
    @Input() showHud = true;

    public debugOctree = false;

    private engine = inject(ThreeEngineService);
    private physics = inject(OctreePhysicsService);

    private keyStates: Record<string, boolean> = {};
    private mouseTime = 0;

    ngAfterViewInit(): void {
        const container = this.containerRef.nativeElement;

        this.engine.init(container, this.showStats);
        this.physics.init(this.engine.scene, this.engine.camera, {
            modelUrl: this.modelUrl,
            gravity: this.gravity,
            numSpheres: this.numSpheres,
            sphereRadius: this.sphereRadius,
            stepsPerFrame: this.stepsPerFrame
        });

        this.engine.startLoop((delta) => {
            this.physics.step(delta, this.keyStates);
        });
    }

    public onContainerMouseDown(): void {
        document.body.requestPointerLock();
        this.mouseTime = performance.now();
    }

    public toggleOctreeDebug(visible: boolean): void {
        this.debugOctree = visible;
        this.physics.setDebugVisibility(visible);
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.keyStates[event.code] = true;
    }

    @HostListener('document:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.keyStates[event.code] = false;
    }

    @HostListener('document:mouseup')
    onMouseUp(): void {
        if (document.pointerLockElement !== null) {
            const holdDuration = performance.now() - this.mouseTime;
            this.physics.throwBall(holdDuration);
        }
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (document.pointerLockElement === document.body) {
            this.engine.camera.rotation.y -= event.movementX / 500;
            this.engine.camera.rotation.x -= event.movementY / 500;
        }
    }

    ngOnDestroy(): void {
        if (document.pointerLockElement === document.body) {
            document.exitPointerLock();
        }
    }
}