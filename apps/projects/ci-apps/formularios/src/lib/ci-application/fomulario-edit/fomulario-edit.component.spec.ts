import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioEditComponent } from './fomulario-edit.component';


describe('EditComponent', () => {
  let component: FormularioEditComponent;
  let fixture: ComponentFixture<FormularioEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormularioEditComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FormularioEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
