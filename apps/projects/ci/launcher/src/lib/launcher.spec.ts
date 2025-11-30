import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Launcher } from './home/launcher';

describe('Launcher', () => {
  let component: Launcher;
  let fixture: ComponentFixture<Launcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Launcher]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Launcher);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
