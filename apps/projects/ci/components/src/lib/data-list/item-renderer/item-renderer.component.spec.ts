import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemRendererComponent } from './item-renderer.component';

describe('ItemRendererComponent', () => {
  let component: ItemRendererComponent;
  let fixture: ComponentFixture<ItemRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemRendererComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ItemRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
