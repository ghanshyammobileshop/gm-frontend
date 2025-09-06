import { Component, OnInit } from '@angular/core';
import { DbStats } from 'app/models/statistics';
import { UserService } from 'app/services/user.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-view-settings',
  templateUrl: './view-settings.component.html',
  styleUrl: './view-settings.component.scss',
})
export class ViewSettingsComponent implements OnInit {

  dbStats: DbStats | null = null;

  constructor(
    private _utilService: UtilService,
    private _userService: UserService,
  ) { }

  ngOnInit(): void {
    this.getDbStatsDetails();
  }

  async getDbStatsDetails() {
    try {
      this._utilService.showLoader();
      this.dbStats = await this._userService.getDbStats();
    } catch (error) {
      this._utilService.showErrorSnack(error);
    } finally {
      this._utilService.hideLoader();
    }
  }
}

