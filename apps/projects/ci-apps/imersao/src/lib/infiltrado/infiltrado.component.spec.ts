import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfiltradoComponent } from './infiltrado.component';

describe('InfiltradoComponent', () => {
  let component: InfiltradoComponent;
  let fixture: ComponentFixture<InfiltradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfiltradoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InfiltradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
