import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortable, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessControls } from 'app/const';
import { PaginationModel } from 'app/models/common';
import { Customer } from 'app/models/customer';
import { CustomerService } from 'app/services/customer.service';
import { StorageService } from 'app/services/storage.service';
import { UserService } from 'app/services/user.service';
import { UtilService } from 'app/services/util.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
	selector: 'app-customer-list',
	templateUrl: './customer-list.component.html',
	styleUrl: './customer-list.component.scss'
})
export class CustomerListComponent implements OnInit {

	accessControls = AccessControls;
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	displayedColumns: string[] = ['no', 'name', 'mobileNo1', 'mobileNo2', 'email', 'action'];
	dataSource = new MatTableDataSource<Customer>();

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
		private _customerService: CustomerService,
		private _activatedRoute: ActivatedRoute,
		private _router: Router,
		private _utilService: UtilService,
		private _storageService: StorageService,
		public _userService: UserService,
	) { }

	ngOnInit(): void {
		this.searchForm = this._fb.group({
			searchString: new FormControl(null),
			status: new FormControl(null),
			sortBy: new FormControl(''),
			sortOrder: new FormControl(''),
			shopId: new FormControl(this._storageService.getCurrentShopAccess()),
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
					if (params?.status && !this.searchForm.value.status) {
						options['status'] = params?.status
					}
					if (params?.sortBy && !this.searchForm.value.sortBy) {
						options['sortBy'] = params?.sortBy;
					}
					if (params?.sortOrder && !this.searchForm.value.sortOrder) {
						options['sortOrder'] = params?.sortOrder;
					}
					if (params?.shopId && !this.searchForm.value.shopId) {
						options['shopId'] = params?.shopId;
					}

					this.searchForm.patchValue(options);
				} catch (error) {
					this._utilService.showErrorSnack(error);
				}
			});


		this.searchForm.get('searchString')?.valueChanges
			.pipe(takeUntil(this.onDestroy), debounceTime(500), distinctUntilChanged(),)
			.subscribe((_value) => {
				this.resetPagination()
				this.getCustomerList()
			});
		this.getCustomerList();
	}

	resetPagination() {
		this.pagination.pageIndex = 0;
	}

	updateRoute() {
		const data = {
			page: this.pagination.pageIndex,
			size: this.pagination.pageSize,
			searchString: this.searchForm.value.searchString ?? '',
			status: this.searchForm.value.status ?? '',
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

		this.getCustomerList();
	}

	filterParams(): HttpParams {
		let params = new HttpParams();
		params = params.append('skip', this.pagination.pageIndex * this.pagination.pageSize);
		params = params.append('limit', this.pagination.pageSize);

		if (this.searchForm.value.searchString) {
			params = params.append('searchString', this.searchForm.value.searchString);
		}
		if (this.searchForm.value.status) {
			params = params.append('status', this.searchForm.value.status);
		}
		if (this.searchForm.value.sortBy) {
			params = params.append('sortBy', this.searchForm.value.sortBy);
		}
		if (this.searchForm.value.sortOrder) {
			params = params.append('sortOrder', this.searchForm.value.sortOrder);
		}
		if (this.searchForm.value.shopId) {
			params = params.append('shopId', this.searchForm.value.shopId);
		}
		this.updateRoute();
		return params;
	}

	async getCustomerList() {
		try {
			const response = await this._customerService.getCustomerList(this.filterParams());
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
		this.getCustomerList();
	}

	goTo(path: string | null) {
		if (path) {
			this._router.navigate(
				[path],
				{
					relativeTo: this._activatedRoute,
					queryParams: { q: this._utilService.encode(this.urlParams) }
				}
			);
		}
	}
}
