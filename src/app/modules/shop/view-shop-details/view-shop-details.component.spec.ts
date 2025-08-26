import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewShopDetailsComponent } from './view-shop-details.component';

describe('ViewShopDetailsComponent', () => {
  let component: ViewShopDetailsComponent;
  let fixture: ComponentFixture<ViewShopDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewShopDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewShopDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
