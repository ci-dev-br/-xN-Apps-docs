import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataListComponent } from './data-list.component';

describe('DataListComponent', () => {
  let component: DataListComponent<unknown>;
  let fixture: ComponentFixture<DataListComponent<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DataListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
