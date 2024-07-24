import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IlustradorComponent } from './ilustrador.component';

describe('IlustradorComponent', () => {
  let component: IlustradorComponent;
  let fixture: ComponentFixture<IlustradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IlustradorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IlustradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
