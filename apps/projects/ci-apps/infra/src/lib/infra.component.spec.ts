import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfraComponent } from './infra.component';

describe('InfraComponent', () => {
  let component: InfraComponent;
  let fixture: ComponentFixture<InfraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InfraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
