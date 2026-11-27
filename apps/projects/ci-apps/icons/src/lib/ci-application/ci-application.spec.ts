import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import {
    createStarterTemplate,
    moveLayerByDelta,
    optimizeSvgString,
    parseSvgToDocument,
    sanitizeSvgString,
    serializeDocumentToSvg,
} from '../models/svg-editor.model';

describe('Àpps Icons', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomeComponent, NoopAnimationsModule]
        }).compileComponents();

        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Componente criado com sucesso', () => {
        expect(component).toBeTruthy();
    });

    it('Deve fazer parse, movimentação de camada e serialização SVG corretamente', () => {
        const template = createStarterTemplate('app-badge', '0 0 160 160');
        const doc = parseSvgToDocument(template);
        expect(doc.viewBox).toBe('0 0 160 160');
        expect(doc.layers.length).toBeGreaterThan(0);

        const moved = moveLayerByDelta(doc.layers[0], 10, -5);
        expect(moved.x).toBe((doc.layers[0].x || 0) + 10);
        expect(moved.y).toBe((doc.layers[0].y || 0) - 5);

        const serialized = serializeDocumentToSvg({ ...doc, layers: [moved] });
        expect(serialized).toContain('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">');
        expect(serialized).toContain('<rect');
    });

    it('Deve sanitizar scripts e otimizar metadados / currentColor', () => {
        const dirty = '<svg viewBox="0 0 24 24"><metadata><?xpacket begin=""?></metadata><script>alert(1)</script><path d="M0 0h24" fill="#ff0000" onclick="hack()"/></svg>';
        const sanitized = sanitizeSvgString(dirty);
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('onclick=');

        const optimized = optimizeSvgString(sanitized, { stripMetadata: true, convertToCurrentColor: true });
        expect(optimized).not.toContain('<metadata');
        expect(optimized).toContain('currentColor');
    });
});
