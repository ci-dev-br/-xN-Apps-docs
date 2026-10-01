import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscadorComponent } from './discador.component';

describe('DiscadorComponent', () => {
  let component: DiscadorComponent;
  let fixture: ComponentFixture<DiscadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscadorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
