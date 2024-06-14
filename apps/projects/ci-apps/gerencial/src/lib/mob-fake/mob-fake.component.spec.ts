import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobFakeComponent } from './mob-fake.component';

describe('MobFakeComponent', () => {
  let component: MobFakeComponent;
  let fixture: ComponentFixture<MobFakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobFakeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MobFakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
