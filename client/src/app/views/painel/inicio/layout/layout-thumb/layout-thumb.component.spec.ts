import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutThumbComponent } from './layout-thumb.component';

describe('LayoutThumbComponent', () => {
  let component: LayoutThumbComponent;
  let fixture: ComponentFixture<LayoutThumbComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LayoutThumbComponent]
    });
    fixture = TestBed.createComponent(LayoutThumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
