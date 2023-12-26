import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UxKitComponent } from './ux-kit.component';

describe('UxKitComponent', () => {
  let component: UxKitComponent;
  let fixture: ComponentFixture<UxKitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UxKitComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UxKitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
