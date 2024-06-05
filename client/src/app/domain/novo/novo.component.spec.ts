import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NovoComponent } from './novo.component';

describe('NovoComponent', () => {
  let component: NovoComponent;
  let fixture: ComponentFixture<NovoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NovoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
