import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LowCodeComponent } from './low-code.component';

describe('LowCodeComponent', () => {
  let component: LowCodeComponent;
  let fixture: ComponentFixture<LowCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LowCodeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LowCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
