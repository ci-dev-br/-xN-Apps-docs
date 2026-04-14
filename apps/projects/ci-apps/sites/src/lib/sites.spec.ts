import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SitesComponent } from './sites.component';
import { SitesModule } from './sites.module';

describe('Àpps Sites', () => {
    let component: SitesComponent;
    let fixture: ComponentFixture<SitesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SitesModule]
        })
            .compileComponents();

        fixture = TestBed.createComponent(SitesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Componente criado com sucesso', () => {
        expect(component).toBeTruthy();
    });
});
