import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataGroupComponent } from './data-group.component';

describe('DataGroupComponent', () => {
  let component: DataGroupComponent;
  let fixture: ComponentFixture<DataGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataGroupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DataGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
