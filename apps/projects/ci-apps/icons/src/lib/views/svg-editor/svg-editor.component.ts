import { Component, ElementRef, HostListener, OnInit, ViewChild } from "@angular/core";
interface Circle {
    cx: number;
    cy: number;
    r: number;
    fill: string;
}
interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
}
interface Image {
    x: number;
    y: number;
    width: number;
    height: number;
    href: string;
}
@Component({
    selector: 'ci-svg-editor',
    templateUrl: 'svg-editor.component.html',
    styleUrls: ['svg-editor.component.scss']
})
export class SvgEditorComponent implements OnInit {
    public selectedElement?: any;
    private selectedElementType: string = '';
    private isDragging: boolean = false;
    private offsetX: number = 0;
    private offsetY: number = 0;
    @ViewChild('svgContainer') svgContainer!: ElementRef;
    width = 0;
    height = 0;
    circles: Circle[] = [];
    rectangles: Rectangle[] = [];
    images: Image[] = [];
    constructor(
        private readonly el: ElementRef<HTMLElement>
    ) {
    }
    async ngOnInit() {
        let getSize = () => {
            let { width, height } = this.el.nativeElement.getBoundingClientRect();
            this.height = height - 50;
            this.width = width - 50;
        }
        getSize();
        this.el.nativeElement.onresize = (r) => {
            getSize();
        }
    }
    addCircle() {
        this.circles.push({ cx: 50, cy: 50, r: 20, fill: 'red' });
    }
    addRectangle() {
        this.rectangles.push({ x: 100, y: 100, width: 50, height: 30, fill: 'blue' });
    }
    addImage(event: any) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.images.push({ x: 200, y: 200, width: 100, height: 80, href: e.target.result });
        };
        reader.readAsDataURL(file);
    }
    startDrag(event: MouseEvent, element: any, type: string) {
        this.selectedElement = element;
        this.selectedElementType = type;
        this.isDragging = true;
        const svgRect = this.svgContainer.nativeElement.getBoundingClientRect();
        this.offsetX = event.clientX - svgRect.left - element.x;
        this.offsetY = event.clientY - svgRect.top - element.y;
    }
    @HostListener('mousemove', ['$event'])
    onDrag(event: MouseEvent) {
        if (this.isDragging && this.selectedElement) {
            const svgRect = this.svgContainer.nativeElement.getBoundingClientRect();
            let newX = event.clientX - svgRect.left - (this.offsetX || 0);
            let newY = event.clientY - svgRect.top - (this.offsetY || 0);
            if (this.selectedElementType === 'circle') {
                this.selectedElement.cx = newX;
                this.selectedElement.cy = newY;
            } else if (this.selectedElementType === 'rect') {
                this.selectedElement.x = newX;
                this.selectedElement.y = newY;
            } else if (this.selectedElementType === 'image') {
                this.selectedElement.x = newX;
                this.selectedElement.y = newY;
            }
        }
    }
    @HostListener('mouseup')
    stopDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            // this.selectedElement = null;
            // this.selectedElementType = '';
        }
    }
}