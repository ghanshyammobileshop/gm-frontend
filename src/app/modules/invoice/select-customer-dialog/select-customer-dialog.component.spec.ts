import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCustomerDialogComponent } from './select-customer-dialog.component';

describe('SelectCustomerDialogComponent', () => {
  let component: SelectCustomerDialogComponent;
  let fixture: ComponentFixture<SelectCustomerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectCustomerDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectCustomerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
