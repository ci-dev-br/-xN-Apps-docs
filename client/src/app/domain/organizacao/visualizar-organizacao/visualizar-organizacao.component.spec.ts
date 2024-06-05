import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarOrganizacaoComponent } from './visualizar-organizacao.component';

describe('VisualizarOrganizacaoComponent', () => {
  let component: VisualizarOrganizacaoComponent;
  let fixture: ComponentFixture<VisualizarOrganizacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizarOrganizacaoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisualizarOrganizacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
