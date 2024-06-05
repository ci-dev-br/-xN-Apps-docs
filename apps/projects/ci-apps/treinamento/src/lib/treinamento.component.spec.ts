import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreinamentoComponent } from './treinamento.component';

describe('TreinamentoComponent', () => {
  let component: TreinamentoComponent;
  let fixture: ComponentFixture<TreinamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreinamentoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TreinamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
