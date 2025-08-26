import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Optional, Output, Self, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BehaviorSubject, Observable, Subject, debounceTime, distinctUntilChanged, lastValueFrom, takeUntil } from 'rxjs';

@Component({
  selector: 'app-ng-select-dropdown',
  templateUrl: './ng-select-dropdown.component.html',
  styleUrls: ['./ng-select-dropdown.component.css'],
  standalone: true,
  providers: [DatePipe],
  imports: [CommonModule, NgSelectModule, FormsModule, ReactiveFormsModule],
})
export class NgSelectDropdownComponent implements OnInit, OnDestroy, ControlValueAccessor, OnChanges {

  @Input() callBackGetData!: (param: any, callback: any) => void;
  @Input() callBackGetDataById!: (id: string, callback: any) => void;
  @Input() url: string = '';
  @Input() placeholder: string = '';
  @Input() outputPattern: any[] = [];
  @Input() bindLabelPattern: any[] = [];
  @Input() bindLabel: string = 'name';
  @Input() uniqueKey: string = 'id';
  @Input() initValueId: string = '';
  @Input() initValueObject: any;
  @Input() searchableKey: string = 'searchString';
  @Output() changeEvent = new EventEmitter<any>();

  datePattern = 'yyyy/MM/dd HH:mm';
  onDestroy = new Subject<void>();
  input$ = new Subject<string>();
  options = new BehaviorSubject<any[]>([]);
  options$: Observable<any> | undefined;
  data = <any>[];

  selectItem: any;
  isFieldDisabled: boolean = false;
  valueType: ValueType = ValueType.noType;

  totalPages = 0;
  currentPage = 1;
  limit = 10;
  isDataLoading: boolean = false;
  reqParam: any;

  onChange = (value: any) => { }

  onTouched = () => { };

  constructor(private http: HttpClient, private datePipe: DatePipe,
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

  resolvePath(obj: any, path: string) {
    var properties = path.split('.');
    return properties.reduce((prev: any, curr: any) => prev?.[curr], obj);
  }

  getDataFromPattern(options: any, pattern: any) {
    let pt = pattern['pattern'];
    let isDate = pattern['isDate'] ?? false;
    let datePattern = pattern['datePattern'] ?? this.datePattern;
    if (isDate) {
      let date = this.datePipe.transform(this.resolvePath(options, pt), datePattern);
      return date;
    } else {
      let data = this.resolvePath(options, pt);
      return data;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  writeValue(formValue: any): void {
    if (formValue == undefined || formValue == null || formValue == '') {
      this.selectItem = null;
      return;
    }

    if (typeof formValue === 'string') {
      this.initValueId = formValue ?? '';
      this.valueType = ValueType.hasStringValue;
    } else if (typeof formValue === 'object') {
      this.initValueObject = formValue;
      this.valueType = ValueType.hasObjectValue;
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

    if (this.selectItem == null) {
      this.submitResult(this.selectItem);
      return;
    }

    if (!this.outputPattern.length) {
      this.submitResult(this.selectItem);
      return;
    }

    const [selected] = this.data.filter((el: any) => el[this.uniqueKey] === this.selectItem);

    if (selected == null || selected == undefined) {
      return;
    }

    if (this.outputPattern.length == 1 && this.outputPattern[0] === 'object') {
      this.submitResult(selected);
      return;
    }

    if (this.outputPattern.length == 1) {
      this.submitResult(selected[this.outputPattern[0]]);
      return;
    }

    const result: any = {}
    this.outputPattern.forEach((pattern: string) => {
      selected[pattern] && (result[pattern] = selected[pattern])
    })

    this.submitResult(result);
  }

  submitResult(value: any) {
    if (value) {
      this.onTouched();
      this.onChange(value);
      this.changeEvent.next(value);
    }
  }

  observableArray() {
    this.options$ = this.options.asObservable();
  }

  ngOnInit() {
    if (this.valueType == ValueType.noType) {
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

  async reload(): Promise<void> {
    this.data = [];
    this.applyDataToObservable();
    this.selectItem = null;
    this.totalPages = 0;
    this.currentPage = 1;
    this.reqParam[this.searchableKey] = '';
    this.reqParam.skip = 0;
    await this.getApiData();
  }

  async preLoading() {
    this.data = [];
    this.applyDataToObservable();

    this.reqParam = {
      limit: this.limit,
      skip: 0,
      [this.searchableKey]: ''
    };

    if (this.valueType == ValueType.hasStringValue) {
      if (this.initValueId) {
        await this.getApiDataById();
        const selected = this.data.find((el: any) => el[this.uniqueKey] === this.initValueId);
        this.selectItem = selected[this.uniqueKey]
        this.changeValues();
      }
    } else if (this.valueType == ValueType.hasObjectValue) {
      if (this.initValueObject) {
        this.addToArray([this.initValueObject]);
        this.applyDataToObservable();
        this.selectItem = this.initValueObject[this.uniqueKey]
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
      if (response != null) {
        this.addToArray(response.items);
        this.applyDataToObservable();
        let totalItems = response.count ?? 0;
        this.totalPages = Math.ceil(totalItems / this.limit);
        this.currentPage = this.currentPage + 1;
        this.reqParam.skip = this.data.length;
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.isDataLoading = false;
    }
  }

  async getApiDataById() {
    try {
      this.isDataLoading = true;
      var response = await this.callApiById();
      if (response != null) {
        this.addToArray([response]);
        this.applyDataToObservable();
      }
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

  callApiById(): Promise<any> {
    if (this.callBackGetDataById != null && this.callBackGetDataById != undefined) {
      return this.getDataByIdFromCallBackFunc(this.initValueId);
    } else {
      return lastValueFrom(this.http.get<any>(this.url + '/' + this.initValueId));
    }
  }

  getDataByIdFromCallBackFunc(params: any): Promise<any> {
    return new Promise((resolve, _) => {
      this.callBackGetDataById(params, (callback: any) => {
        resolve(callback);
      });
    });
  }
}

enum ValueType { noType, hasStringValue, hasObjectValue }
