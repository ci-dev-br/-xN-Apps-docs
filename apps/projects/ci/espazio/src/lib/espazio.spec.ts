import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Espazio } from './espazio';

describe('Espazio', () => {
  let component: Espazio;
  let fixture: ComponentFixture<Espazio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Espazio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Espazio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
