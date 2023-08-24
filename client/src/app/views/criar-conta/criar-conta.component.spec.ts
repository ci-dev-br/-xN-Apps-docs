import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriarContaComponent } from './criar-conta.component';

describe('CriarContaComponent', () => {
  let component: CriarContaComponent;
  let fixture: ComponentFixture<CriarContaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CriarContaComponent]
    });
    fixture = TestBed.createComponent(CriarContaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
