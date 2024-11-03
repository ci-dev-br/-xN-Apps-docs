import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PesquisarContatoComponent } from './pesquisar-contato.component';

describe('PesquisarContatoComponent', () => {
  let component: PesquisarContatoComponent;
  let fixture: ComponentFixture<PesquisarContatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PesquisarContatoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PesquisarContatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
