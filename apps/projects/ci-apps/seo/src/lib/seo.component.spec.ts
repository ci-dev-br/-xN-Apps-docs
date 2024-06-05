import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SEOComponent } from './seo.component';

describe('SEOComponent', () => {
  let component: SEOComponent;
  let fixture: ComponentFixture<SEOComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SEOComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SEOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
