import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermosComponent } from './termos.component';

describe('TermosComponent', () => {
  let component: TermosComponent;
  let fixture: ComponentFixture<TermosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TermosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
