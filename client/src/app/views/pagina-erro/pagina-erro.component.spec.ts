import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaErroComponent } from './pagina-erro.component';

describe('PaginaErroComponent', () => {
  let component: PaginaErroComponent;
  let fixture: ComponentFixture<PaginaErroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaginaErroComponent]
    });
    fixture = TestBed.createComponent(PaginaErroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
