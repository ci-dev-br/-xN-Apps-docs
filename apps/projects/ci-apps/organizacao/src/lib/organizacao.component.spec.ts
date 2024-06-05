import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizacaoComponent } from './organizacao.component';

describe('OrganizacaoComponent', () => {
  let component: OrganizacaoComponent;
  let fixture: ComponentFixture<OrganizacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizacaoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrganizacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
