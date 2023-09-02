import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerencialComponent } from './gerencial.component';

describe('GerencialComponent', () => {
  let component: GerencialComponent;
  let fixture: ComponentFixture<GerencialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GerencialComponent]
    });
    fixture = TestBed.createComponent(GerencialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
