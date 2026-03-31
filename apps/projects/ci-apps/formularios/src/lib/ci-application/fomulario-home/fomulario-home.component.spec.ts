import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioHomeComponent } from './fomulario-home.component';

describe('HomeComponent', () => {
  let component: FormularioHomeComponent;
  let fixture: ComponentFixture<FormularioHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormularioHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
