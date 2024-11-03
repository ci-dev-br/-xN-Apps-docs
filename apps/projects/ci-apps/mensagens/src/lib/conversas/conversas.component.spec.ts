import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversasComponent } from './conversas.component';

describe('ConversasComponent', () => {
  let component: ConversasComponent;
  let fixture: ComponentFixture<ConversasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConversasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
