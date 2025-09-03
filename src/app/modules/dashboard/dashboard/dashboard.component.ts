import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ShopDropdownList } from 'app/models/shop.model';
import { StatisticsModel } from 'app/models/statistics';
import { ShopService } from 'app/services/shop.service';
import { StorageService } from 'app/services/storage.service';
import { UserService } from 'app/services/user.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  searchForm!: FormGroup;
  shopDropdown: ShopDropdownList[] | null = null;
  shopId: string | null = null;
  statistics: StatisticsModel | null = null;

  constructor(
    private _fb: FormBuilder,
    private _shopService: ShopService,
    private _utilService: UtilService,
    private _storageService: StorageService,
    private _userService: UserService,
  ) { }

  ngOnInit(): void {
    this.searchForm = this._fb.group({
      shopId: new FormControl(null),
    });

    this.getShopList();
  }

  async changeShop(event: MatSelectChange) {
    try {
      if (event.value) {
        this.shopId = event.value;
        this._storageService.setCurrentShopAccess(event.value);
      }
      this._utilService.showLoader();
      this.statistics = await this._userService.getStatistics(this.shopId!);
    } catch (error: any) {
      this._utilService.showErrorSnack(error);
    } finally {
      this._utilService.hideLoader();
    }
  }

  async getShopList() {
    try {
      this._utilService.showLoader();
      this.shopDropdown = await this._shopService.getShopListByAccess();
      let localShopAccessId = this._storageService.getCurrentShopAccess();
      if (localShopAccessId) {
        this.shopId = localShopAccessId;
      } else {
        this.shopId = this.shopDropdown.length > 0 ? this.shopDropdown[0].id : null;
        if (this.shopId != null) {
          this._storageService.setCurrentShopAccess(this.shopId);
        }
      }
      this.searchForm.patchValue({
        shopId: this.shopId,
      });

      this.statistics = await this._userService.getStatistics(this.shopId!);
    } catch (error: any) {
      this._utilService.showErrorSnack(error);
    } finally {
      this._utilService.hideLoader();
    }
  }

}
