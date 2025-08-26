import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessControls } from 'app/const';
import { Shop } from 'app/models/shop.model';
import { ShopService } from 'app/services/shop.service';
import { UserService } from 'app/services/user.service';
import { UtilService } from 'app/services/util.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
	selector: 'app-shop-list',
	templateUrl: './shop-list.component.html',
	styleUrl: './shop-list.component.scss'
})
export class ShopListComponent implements OnInit {

	accessControls = AccessControls;
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	displayedColumns: string[] = ['name', 'invoiceType', 'invoicePrefix', 'active', 'action'];
	dataSource = new MatTableDataSource<Shop>();

	searchForm!: FormGroup;
	onDestroy = new Subject<void>();

	urlParams: any = null;

	constructor(
		private _fb: FormBuilder,
		private _shopService: ShopService,
		private _activatedRoute: ActivatedRoute,
		private _router: Router,
		private _utilService: UtilService,
		public _userService: UserService,
	) { }

	ngOnInit(): void {
		this.searchForm = this._fb.group({
			searchString: new FormControl(null),
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

					this.searchForm.patchValue(options);
				} catch (error) {
					this._utilService.showErrorSnack(error);
				}
			});


		this.searchForm.get('searchString')?.valueChanges
			.pipe(takeUntil(this.onDestroy), debounceTime(500), distinctUntilChanged(),)
			.subscribe((_value) => {
				this.getShopList()
			});

		this.getShopList();
	}

	updateRoute() {
		const data = {
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

		this.getShopList();
	}

	filterParams(): HttpParams {
		let params = new HttpParams();

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
		this.updateRoute();
		return params;
	}

	async getShopList() {
		try {
			const response = await this._shopService.getAllShop(this.filterParams());
			this.dataSource.data = response;
		} catch (error) {
			this._utilService.showErrorSnack(error);
		}
	};

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
