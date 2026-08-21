import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home/home.component';

describe('Àpps Treinamento', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomeComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Componente criado com sucesso', () => {
        expect(component).toBeTruthy();
    });
});
