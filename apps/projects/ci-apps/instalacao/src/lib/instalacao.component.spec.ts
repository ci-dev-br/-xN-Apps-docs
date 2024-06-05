import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstalacaoComponent } from './instalacao.component';

describe('InstalacaoComponent', () => {
  let component: InstalacaoComponent;
  let fixture: ComponentFixture<InstalacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstalacaoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstalacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
