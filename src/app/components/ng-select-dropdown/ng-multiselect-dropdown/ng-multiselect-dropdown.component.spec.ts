import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgMultiselectDropdownComponent } from './ng-multiselect-dropdown.component';

describe('NgMultiselectDropdownComponent', () => {
  let component: NgMultiselectDropdownComponent;
  let fixture: ComponentFixture<NgMultiselectDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgMultiselectDropdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgMultiselectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
