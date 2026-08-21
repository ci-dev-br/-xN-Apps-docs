import { ComponentFixture, TestBed } from '@angular/core/testing';


import { BlogComponent } from './blog.component';
import { BlogModule } from './blog.module';

describe('Àpps Blog', () => {
    let component: BlogComponent;
    let fixture: ComponentFixture<BlogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BlogModule]
        })
            .compileComponents();

        fixture = TestBed.createComponent(BlogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Componente criado com sucesso', () => {
        expect(component).toBeTruthy();
    });
});
