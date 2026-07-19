import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarMomentoComponent } from './registrar-momento.component';

describe('RegistrarMomentoComponent', () => {
  let component: RegistrarMomentoComponent;
  let fixture: ComponentFixture<RegistrarMomentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarMomentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarMomentoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
