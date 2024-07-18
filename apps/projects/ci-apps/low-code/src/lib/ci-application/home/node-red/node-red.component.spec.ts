import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeRedComponent } from './node-red.component';

describe('NodeRedComponent', () => {
  let component: NodeRedComponent;
  let fixture: ComponentFixture<NodeRedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeRedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NodeRedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
