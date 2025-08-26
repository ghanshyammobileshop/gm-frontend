import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortable, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessControls } from 'app/const';
import { PaginationModel } from 'app/models/common';
import { User } from 'app/models/user';
import { AppUserService } from 'app/services/app-user.service';
import { UserService } from 'app/services/user.service';
import { UtilService } from 'app/services/util.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
	selector: 'app-admin-user-list',
	templateUrl: './admin-user-list.component.html',
	styleUrl: './admin-user-list.component.scss'
})
export class AdminUserListComponent implements OnInit {

	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	accessControls = AccessControls;

	displayedColumns: string[] = ['no', 'name', 'email', 'role', 'active', 'action'];
	dataSource = new MatTableDataSource<User>();

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
		private _appUserService: AppUserService,
		public _userService: UserService,
		private _activatedRoute: ActivatedRoute,
		private _router: Router,
		private _utilService: UtilService,
	) { }

	ngOnInit(): void {
		this.searchForm = this._fb.group({
			searchString: new FormControl(null),
			role: new FormControl(null),
			status: new FormControl(null),
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
					if (params?.role && !this.searchForm.value.role) {
						options['role'] = params?.role
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

					this.searchForm.patchValue(options);
				} catch (error) {
					this._utilService.showErrorSnack(error);
				}
			});


		this.searchForm.get('searchString')?.valueChanges
			.pipe(takeUntil(this.onDestroy), debounceTime(500), distinctUntilChanged())
			.subscribe((_value) => {
				this.resetPagination()
				this.getAdminUserList()
			});
		this.getAdminUserList();
	}

	resetPagination() {
		this.pagination.pageIndex = 0;
	}

	updateRoute() {
		const data = {
			page: this.pagination.pageIndex,
			size: this.pagination.pageSize,
			searchString: this.searchForm.value.searchString ?? '',
			role: this.searchForm.value.role ?? '',
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

		this.getAdminUserList();
	}

	filterParams(): HttpParams {
		let params = new HttpParams();
		params = params.append('skip', this.pagination.pageIndex * this.pagination.pageSize);
		params = params.append('limit', this.pagination.pageSize);

		if (this.searchForm.value.searchString) {
			params = params.append('searchString', this.searchForm.value.searchString);
		}
		if (this.searchForm.value.role) {
			params = params.append('role', this.searchForm.value.role);
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
		this.updateRoute();
		return params;
	}

	async getAdminUserList() {
		try {
			const response = await this._appUserService.getAdminUserList(this.filterParams());
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
		this.getAdminUserList();
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
