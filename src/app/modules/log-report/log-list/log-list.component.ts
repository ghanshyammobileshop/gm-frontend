import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortable, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessControls } from 'app/const';
import { PaginationModel } from 'app/models/common';
import { ConstantsValue, Log } from 'app/models/log';
import { LogService } from 'app/services/log.service';
import { UtilService } from 'app/services/util.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
	selector: 'app-log-list',
	templateUrl: './log-list.component.html',
	styleUrl: './log-list.component.scss'
})
export class LogListComponent implements OnInit {
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	accessControls = AccessControls;
	constantValues: ConstantsValue | null = null;

	displayedColumns: string[] = ['no', 'name', 'type', 'action', 'operation', 'description', 'createdAt',];
	dataSource = new MatTableDataSource<Log>();

	pagination: PaginationModel = {
		pageSizeOptions: [10, 25, 50, 100],
		pageSize: 10,
		pageIndex: 0,
	};

	searchForm!: FormGroup;
	onDestroy = new Subject<void>();

	urlParams: any = null;

	constructor(
		private _fb: FormBuilder,
		private _logService: LogService,
		private _utilService: UtilService,
		private _activatedRoute: ActivatedRoute,
		private _router: Router,
	) { }

	ngOnInit(): void {
		this.searchForm = this._fb.group({
			searchString: new FormControl(null),
			action: new FormControl(null),
			type: new FormControl(null),
			operation: new FormControl(null),
			sortBy: new FormControl(''),
			sortOrder: new FormControl(''),
		});

		this._activatedRoute.queryParams
			.pipe(takeUntil(this.onDestroy))
			.subscribe((p) => {
				try {
					const params: any = this._utilService.decode(p.q);
					this.urlParams = params;
					const options: any = {};
					if (params?.page && !this.pagination.pageIndex) {
						this.pagination.pageIndex = parseInt(params?.page)
					}
					if (params?.size) {
						this.pagination.pageSize = params?.size
					}
					if (params?.searchString && !this.searchForm.value.searchString) {
						options['searchString'] = params?.searchString
					}
					if (params?.action && !this.searchForm.value.action) {
						options['action'] = params?.action;
					}
					if (params?.type && !this.searchForm.value.type) {
						options['type'] = params?.type;
					}
					if (params?.operation && !this.searchForm.value.operation) {
						options['operation'] = params?.operation;
					}
					if (params?.sortBy && !this.searchForm.value.sortBy) {
						options['sortBy'] = params?.sortBy;
					}
					if (params?.sortOrder && !this.searchForm.value.sortOrder) {
						options['sortOrder'] = params?.sortOrder;
					}

					this.searchForm.patchValue(options);
				} catch (error) {
					this._utilService.showErrorSnack(error);
				}
			});

		this.searchForm.get('searchString')?.valueChanges
			.pipe(takeUntil(this.onDestroy), debounceTime(500), distinctUntilChanged(),)
			.subscribe(async (_value) => {
				this.resetPagination();
				await this.getLogList();
			});
		this.getLogList();
		this.getConstantValues();
	}

	resetPagination() {
		this.pagination.pageIndex = 0;
	}

	async getConstantValues() {
		try {
			this.constantValues = await this._logService.getConstants();
		} catch (error) {
			this._utilService.showErrorSnack(error);
		}
	}

	updateRoute() {
		const data = {
			page: this.pagination.pageIndex,
			size: this.pagination.pageSize,
			searchString: this.searchForm.value.searchString ?? '',
			action: this.searchForm.value.action ?? '',
			type: this.searchForm.value.type ?? '',
			operation: this.searchForm.value.operation ?? '',
			sortBy: this.searchForm.value.sortBy ?? '',
			sortOrder: this.searchForm.value.sortOrder ?? ''
		};
		this._router.navigate([], {
			replaceUrl: true,
			relativeTo: this._activatedRoute,
			queryParams: { q: this._utilService.encode(data) },
			queryParamsHandling: 'merge',
		});
	}


	ngAfterViewInit() {
		if (this.urlParams?.sortBy && this.urlParams?.sortOrder) {
			this.sort.sort(({ id: this.urlParams.sortBy, start: this.urlParams.sortOrder.toLowerCase() }) as MatSortable);
		}
		this.dataSource.sort = this.sort;
		this.paginator._intl.itemsPerPageLabel = 'Records Per Page';
	}

	ngOnDestroy(): void {
		this.onDestroy.next();
		this.onDestroy.complete();
	}

	sortData(sort: Sort) {
		let direction = sort.direction;
		let column = sort.active;

		if (!column || direction === '') {
			column = '';
			direction = '';
		}

		this.searchForm.patchValue({
			sortBy: column,
			sortOrder: direction
		});

		this.getLogList();
	}

	filterParams(): HttpParams {
		let params = new HttpParams();
		params = params.append('skip', this.pagination.pageIndex * this.pagination.pageSize);
		params = params.append('limit', this.pagination.pageSize);

		if (this.searchForm.value.searchString) {
			params = params.append('searchString', this.searchForm.value.searchString);
		}
		if (this.searchForm.value.action) {
			params = params.append('action', this.searchForm.value.action);
		}
		if (this.searchForm.value.type) {
			params = params.append('type', this.searchForm.value.type);
		}
		if (this.searchForm.value.operation) {
			params = params.append('operation', this.searchForm.value.operation);
		}
		if (this.searchForm.value.sortBy) {
			params = params.append('sortBy', this.searchForm.value.sortBy);
		}
		if (this.searchForm.value.sortOrder) {
			params = params.append('sortOrder', this.searchForm.value.sortOrder);
		}
		this.updateRoute();
		return params;
	}

	async getLogList() {
		try {
			const response = await this._logService.getLogList(this.filterParams());
			this.dataSource.data = response.items;
			this.paginator.pageIndex = this.pagination.pageIndex;
			this.paginator.length = response.count;
		} catch (error) {
			this._utilService.showErrorSnack(error);
		}
	};

	pageChanged(event: PageEvent): void {
		this.pagination.pageSize = event.pageSize;
		this.pagination.pageIndex = event.pageIndex;
		this.getLogList();
	}

	replaceString(description: string): string {
		description = description.replaceAll(/\n/g, "<br class='hide'/>");
		return description;
	}

	goToDetails(row: Log) {
		this._router.navigate(
			['/log-report/details', row.id],
			{
				relativeTo: this._activatedRoute,
				queryParams: { q: this._utilService.encode(this.urlParams) }
			}
		);
	}
}