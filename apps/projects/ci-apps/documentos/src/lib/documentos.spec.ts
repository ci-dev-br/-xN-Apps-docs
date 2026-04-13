import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentosComponent } from './documentos.component';

describe('Àpps Documentos', () => {
    let component: DocumentosComponent;
    let fixture: ComponentFixture<DocumentosComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DocumentosComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(DocumentosComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Componente criado com sucesso', () => {
        expect(component).toBeTruthy();
    });
});
