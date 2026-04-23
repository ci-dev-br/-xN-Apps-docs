import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynFormComponent } from './dyn-form.component';

describe('DynFormComponent', () => {
  let component: DynFormComponent;
  let fixture: ComponentFixture<DynFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DynFormComponent]
    });
    fixture = TestBed.createComponent(DynFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
