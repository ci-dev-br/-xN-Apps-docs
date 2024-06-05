import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImersaoComponent } from './imersao.component';

describe('ImersaoComponent', () => {
  let component: ImersaoComponent;
  let fixture: ComponentFixture<ImersaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImersaoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImersaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
