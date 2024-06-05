import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcessarComponent } from './acessar.component';

describe('AcessarComponent', () => {
  let component: AcessarComponent;
  let fixture: ComponentFixture<AcessarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcessarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AcessarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
