import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocksMakerComponent } from './blocks-maker.component';

describe('BlocksMakerComponent', () => {
  let component: BlocksMakerComponent;
  let fixture: ComponentFixture<BlocksMakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlocksMakerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BlocksMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
