import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodexComponent } from './codex.component';

describe('CodexComponent', () => {
  let component: CodexComponent;
  let fixture: ComponentFixture<CodexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodexComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CodexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
