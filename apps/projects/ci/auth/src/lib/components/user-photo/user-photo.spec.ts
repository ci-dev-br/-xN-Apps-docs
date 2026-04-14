import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserPhoto } from './user-photo';

describe('User Photo Component', () => {
    let component: UserPhoto;
    let fixture: ComponentFixture<UserPhoto>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UserPhoto]
        })
            .compileComponents();

        fixture = TestBed.createComponent(UserPhoto);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Componente criado com sucesso', () => {
        expect(component).toBeTruthy();
    });
});
