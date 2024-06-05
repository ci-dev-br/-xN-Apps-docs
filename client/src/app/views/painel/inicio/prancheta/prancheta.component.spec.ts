import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PranchetaComponent } from './prancheta.component';

describe('PranchetaComponent', () => {
  let component: PranchetaComponent;
  let fixture: ComponentFixture<PranchetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PranchetaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PranchetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
