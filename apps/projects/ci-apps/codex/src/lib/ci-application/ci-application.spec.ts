import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach } from 'node:test';
import { HomepageComponent } from './homepage/homepage.component';

describe('Àpps Codex', () => {
    let component: HomepageComponent;
    let fixture: ComponentFixture<HomepageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomepageComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(HomepageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Componente criado com sucesso', () => {
        expect(component).toBeTruthy();
    });
});
