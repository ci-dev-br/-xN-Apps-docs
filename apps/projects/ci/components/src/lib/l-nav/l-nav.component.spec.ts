import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LNavComponent } from './l-nav.component';

describe('LNavComponent', () => {
  let component: LNavComponent;
  let fixture: ComponentFixture<LNavComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LNavComponent]
    });
    fixture = TestBed.createComponent(LNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
