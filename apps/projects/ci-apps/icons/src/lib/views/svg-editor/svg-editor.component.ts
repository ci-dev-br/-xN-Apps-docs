import { Component, ElementRef, HostListener, OnInit, ViewChild } from "@angular/core";
export interface Circle {
    cx: number;
    cy: number;
    r: number;
    fill: string;
}
export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
}
export interface Image {
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
    fillColor: string = '#ff0000';
    strokeColor: string = '#000000';
    selectedTool: string = 'rect';
    pranchetas?: any[] = [];
    constructor(
        private readonly el: ElementRef<HTMLElement>
    ) {
    }
    async ngOnInit() {
        this.pranchetas = [
            { x: 0, y: 0, width: 500, height: 500, fill: '#ffffff' },
        ]
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
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
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
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
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
    @HostListener('mouseup', ['$event'])
    stopDrag(event: Event) {
        if (this.isDragging) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            this.isDragging = false;
            // this.selectedElement = null;
            // this.selectedElementType = '';
        }
    }
    addShape(event: MouseEvent) {
        const svg = this.svgContainer.nativeElement;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', event.offsetX.toString());
        rect.setAttribute('y', event.offsetY.toString());
        rect.setAttribute('width', '100');
        rect.setAttribute('height', '50');
        rect.setAttribute('fill', this.fillColor);
        rect.setAttribute('stroke', this.strokeColor);
        svg.appendChild(rect);
    }
    saveSvg() {
        const svg = this.svgContainer.nativeElement;
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'my-svg.svg';
        link.click();
    }
}