import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarAplicativoComponent } from './editar-aplicativo.component';

describe('EditarAplicativoComponent', () => {
  let component: EditarAplicativoComponent;
  let fixture: ComponentFixture<EditarAplicativoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditarAplicativoComponent]
    });
    fixture = TestBed.createComponent(EditarAplicativoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
