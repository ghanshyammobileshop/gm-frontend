import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Log } from 'app/models/log';
import { LogService } from 'app/services/log.service';

@Component({
	selector: 'app-log-details',
	templateUrl: './log-details.component.html',
	styleUrl: './log-details.component.scss'
})
export class LogDetailsComponent {
	data?: Log;

	urlParams: any = null;

	constructor(
		private logService: LogService,
		private _activatedRoute: ActivatedRoute,
		private _router: Router,
	) {
		this._activatedRoute.paramMap.subscribe(async (params) => {
			this.data = await this.logService.getLogById(params.get('id') ?? '');
		});

		this._activatedRoute.queryParams.subscribe((params) => {
			this.urlParams = params;
		});
	}

	replaceString(description: string): string {
		description = description.replaceAll(/\n/g, "<br />");
		return description;
	}

	backToList(): void {
		this._router.navigate(['/log-report'], { queryParams: this.urlParams });
	}
}
