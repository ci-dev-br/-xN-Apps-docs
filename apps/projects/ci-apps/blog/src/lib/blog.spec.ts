import { ComponentFixture, TestBed } from '@angular/core/testing';


import { BlogComponent } from './blog.component';

describe('Àpps Blog', () => {
    let component: BlogComponent;
    let fixture: ComponentFixture<BlogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BlogComponent]
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
