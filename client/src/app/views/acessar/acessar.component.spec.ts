import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcessarComponent } from './acessar.component';

describe('AcessarComponent', () => {
  let component: AcessarComponent;
  let fixture: ComponentFixture<AcessarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AcessarComponent]
    });
    fixture = TestBed.createComponent(AcessarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
