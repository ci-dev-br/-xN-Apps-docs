import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowComponent } from './window.component';

describe('JanelaComponent', () => {
  let component: WindowComponent;
  let fixture: ComponentFixture<WindowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WindowComponent]
    });
    fixture = TestBed.createComponent(WindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
