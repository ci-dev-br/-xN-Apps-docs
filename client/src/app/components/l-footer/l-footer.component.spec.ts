import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LFooterComponent } from './l-footer.component';

describe('LFooterComponent', () => {
  let component: LFooterComponent;
  let fixture: ComponentFixture<LFooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LFooterComponent]
    });
    fixture = TestBed.createComponent(LFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
