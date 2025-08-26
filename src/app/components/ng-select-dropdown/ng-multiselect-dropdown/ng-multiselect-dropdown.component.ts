import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BehaviorSubject, Observable, Subject, debounceTime, distinctUntilChanged, lastValueFrom, takeUntil } from 'rxjs';

@Component({
  selector: 'app-ng-multiselect-dropdown',
  templateUrl: './ng-multiselect-dropdown.component.html',
  styleUrls: ['./ng-multiselect-dropdown.component.css'],
  standalone: true,
  providers: [DatePipe],
  imports: [CommonModule, NgSelectModule, FormsModule, ReactiveFormsModule],
})
export class NgMultiselectDropdownComponent implements OnInit, OnDestroy, ControlValueAccessor {

  @Input() callBackGetData!: (param: any, callback: any) => void;
  @Input() callBackGetDataById!: (id: string, callback: any) => void;
  @Input() url: string = '';
  @Input() placeholder: string = '';
  @Input() outputPattern: any[] = [];
  @Input() bindLabel: string = 'name'
  @Input() uniqueKey: string = 'id'
  @Input() initIdArray: string[] = [];
  @Input() initObjectArray: any[] = [];
  @Input() searchableKey: string = 'searchString';
  @Output() changeEvent = new EventEmitter<any>();

  onDestroy = new Subject<void>();
  input$ = new Subject<string>();
  options = new BehaviorSubject<any[]>([]);
  options$: Observable<any> | undefined;
  data = <any>[];

  multiple: boolean = true;
  selectItem: any = [];
  isFieldDisabled: boolean = false;
  valueType: ValueType = ValueType.noArrayType;

  totalPages = 0;
  currentPage = 1;
  limit = 10;
  isDataLoading: boolean = false;
  reqParam: any;

  onChange = (value: any) => { }

  onTouched = () => { };

  constructor(private http: HttpClient,
    @Self() @Optional() public control: NgControl) {
    this.control && (this.control.valueAccessor = this);
    this.observableArray();

    this.input$.pipe(takeUntil(this.onDestroy), debounceTime(500), distinctUntilChanged())
      .subscribe((search) => {
        this.onSearch(search);
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
    this.input$.unsubscribe();
    this.options.unsubscribe();
  }

  writeValue(formValue: any): void {
    if (formValue == undefined || formValue == null || formValue == '' || formValue?.length == 0) {
      this.selectItem = [];
      return
    }

    if (Array.isArray(formValue)) {
      const isStringArray =
        formValue.length > 0 &&
        formValue.every((value) => {
          return typeof value === 'string';
        });

      if (isStringArray) {
        this.initIdArray = formValue ?? [];
        this.valueType = ValueType.hasArrayOfString;
      }

      const isObjectArray =
        formValue.length > 0 &&
        formValue.every((value) => {
          return typeof value === 'object';
        });

      if (isObjectArray) {
        this.initObjectArray = formValue;
        this.valueType = ValueType.hasArrayOfObject;
      }
    }

    this.preLoading();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.changeValues();
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
    this.changeValues();
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isFieldDisabled = isDisabled;
  }

  changeValues() {
    if (!this.outputPattern.length) {
      this.submitResult(this.selectItem);
      return;
    }

    let selected = <any>[];
    this.selectItem.forEach((it: any) => {
      let item = this.data.find((el: any) => el[this.uniqueKey] === it);
      selected.push(item);
    });

    if (this.outputPattern.length == 1 && this.outputPattern[0] === 'object') {
      this.submitResult(selected);
      return;
    }

    let buildOutArray = <any>[];
    if (this.outputPattern.length == 1) {
      selected.forEach((it: any) => {
        buildOutArray.push(it[this.outputPattern[0]]);
      });
      this.submitResult(buildOutArray);
      return;
    }

    let resultArray = <any>[];
    selected.forEach((it: any) => {
      let result: any = {};
      this.outputPattern.forEach((pattern) => {
        it[pattern] && (result[pattern] = it[pattern])
      });
      resultArray.push(result);
    });

    this.submitResult(resultArray);
  }

  submitResult(value: any) {
    this.onTouched();
    this.onChange(value);
    this.changeEvent.next(value);
    // if (value.length) {
    //   this.onTouched();
    //   this.onChange(value);
    //   this.changeEvent.next(value);
    // }
  }

  observableArray() {
    this.options$ = this.options.asObservable();
  }

  ngOnInit() {
    if (this.valueType == ValueType.noArrayType) {
      this.data = [];
      this.applyDataToObservable();

      this.reqParam = {
        limit: this.limit,
        skip: 0,
        [this.searchableKey]: ''
      };

      this.getApiData();
    }
  }

  async preLoading() {
    this.data = [];
    this.applyDataToObservable();

    this.reqParam = {
      limit: this.limit,
      skip: 0,
      [this.searchableKey]: ''
    };

    if (this.valueType == ValueType.hasArrayOfString) {
      if (this.initIdArray) {
        await this.getApiDataById();
        this.selectItem = this.initIdArray;
        this.changeValues();
      }
    } else if (this.valueType == ValueType.hasArrayOfObject) {
      if (this.initObjectArray) {
        this.addToArray(this.initObjectArray);
        this.applyDataToObservable();
        this.selectItem = this.initObjectArray.map((it) => it[this.uniqueKey]);
        this.changeValues();
      }
    }

    await this.getApiData();
  }

  async onSearch(term: string) {
    this.data = [];
    this.applyDataToObservable();
    this.totalPages = 0;
    this.currentPage = 1;
    this.reqParam[this.searchableKey] = term ?? '';
    this.reqParam.skip = 0;
    await this.getApiData();
  }

  async fetchMore() {
    if (!this.isDataLoading) {
      if (this.currentPage <= this.totalPages) {
        await this.getApiData();
      }
    }
  }

  addToArray(values: any) {
    values.forEach((e: any) => {
      const has = this.data.find((el: any) => el[this.uniqueKey] == e[this.uniqueKey]);
      if (!has) {
        this.data.push(e);
      }
    });
  }

  async getApiData() {
    try {
      this.isDataLoading = true;
      var response = await this.callApi(this.reqParam);
      this.addToArray(response.items);
      this.applyDataToObservable();
      let totalItems = response.count ?? 0;
      this.totalPages = Math.ceil(totalItems / this.limit);
      this.currentPage = this.currentPage + 1;
      this.reqParam.skip = this.data.length;
    } catch (error) {
      console.error(error);
    } finally {
      this.isDataLoading = false;
    }
  }

  async getApiDataById() {
    try {
      this.isDataLoading = true;
      await this.asyncForEach(this.initIdArray, async (id: string, index: number) => {
        var response = await this.callApiById(id);
        this.addToArray([response]);
      });
      this.applyDataToObservable();
    } catch (error) {
      console.error(error);
    } finally {
      this.isDataLoading = false;
    }
  }

  applyDataToObservable() {
    if (!this.options.closed) {
      this.options.next(this.data);
    }
  }

  callApi(params: any): Promise<any> {
    if (this.callBackGetData != null && this.callBackGetData != undefined) {
      return this.getDataFromCallBackFunc(params);
    } else {
      return lastValueFrom(this.http.get<any>(this.url, { params: params }));
    }
  }

  getDataFromCallBackFunc(params: any): Promise<any> {
    return new Promise((resolve, _) => {
      this.callBackGetData(params, (callback: any) => {
        resolve(callback);
      });
    });
  }

  callApiById(id: string): Promise<any> {
    if (this.callBackGetDataById != null && this.callBackGetDataById != undefined) {
      return this.getDataByIdFromCallBackFunc(id);
    } else {
      return lastValueFrom(this.http.get<any>(this.url + '/' + id));
    }
  }

  getDataByIdFromCallBackFunc(params: any): Promise<any> {
    return new Promise((resolve, _) => {
      this.callBackGetDataById(params, (callback: any) => {
        resolve(callback);
      });
    });
  }

  async asyncForEach(array: any, callback: any) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}

enum ValueType { noArrayType, hasArrayOfString, hasArrayOfObject }
