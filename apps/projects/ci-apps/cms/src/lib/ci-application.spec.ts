import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CMSComponent } from './cms/cms.component';

describe('Àpps CMS', () => {
    let component: CMSComponent;
    let fixture: ComponentFixture<CMSComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CMSComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(CMSComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Componente criado com sucesso', () => {
        expect(component).toBeTruthy();
    });
});
