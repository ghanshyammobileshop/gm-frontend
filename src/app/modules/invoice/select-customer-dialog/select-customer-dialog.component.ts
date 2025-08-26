import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AccessControls } from 'app/const';
import { PaginationModel } from 'app/models/common';
import { Customer } from 'app/models/customer';
import { CustomerService } from 'app/services/customer.service';
import { UtilService } from 'app/services/util.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
	selector: 'app-select-customer-dialog',
	templateUrl: './select-customer-dialog.component.html',
	styleUrl: './select-customer-dialog.component.scss'
})
export class SelectCustomerDialogComponent implements OnInit {

	accessControls = AccessControls;
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	displayedColumns: string[] = ['no', 'name', 'mobileNo1', 'mobileNo2', 'email'];
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
		private _utilService: UtilService,
		private _dialogRef: MatDialogRef<SelectCustomerDialogComponent>,
	) { }

	ngOnInit(): void {
		this.searchForm = this._fb.group({
			searchString: new FormControl(null),
			status: new FormControl(null),
			sortBy: new FormControl(''),
			sortOrder: new FormControl(''),
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

	ngAfterViewInit() {
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

	openInvoicePage(customerId: string) {
		this._dialogRef.close(customerId);
	}
}
