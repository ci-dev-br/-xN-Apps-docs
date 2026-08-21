import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioHomeComponent } from './formulario-home/formulario-home.component';;

describe('Àpps Formulario', () => {
    let component: FormularioHomeComponent;
    let fixture: ComponentFixture<FormularioHomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormularioHomeComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(FormularioHomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Componente criado com sucesso', () => {
        expect(component).toBeTruthy();
    });
});
