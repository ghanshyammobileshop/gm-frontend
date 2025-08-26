import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AccessControls } from 'app/const';
import { AccessGuard } from 'app/guards/access.guard';
import { MaterialModule } from 'app/material/material.module';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { SelectCustomerDialogComponent } from './select-customer-dialog/select-customer-dialog.component';
import { ViewInvoiceDetailsComponent } from './view-invoice-details/view-invoice-details.component';

const routes: Routes = [
    { path: '', component: InvoiceListComponent, canActivate: [AccessGuard(AccessControls.INVOICE_READ_LIST)] },
    { path: 'form', component: CreateInvoiceComponent, canActivate: [AccessGuard(AccessControls.INVOICE_CREATE)] },
    { path: 'form/:id', component: CreateInvoiceComponent, canActivate: [AccessGuard(AccessControls.INVOICE_UPDATE)] },
    { path: 'view/:id', component: ViewInvoiceDetailsComponent, canActivate: [AccessGuard(AccessControls.INVOICE_READ_DETAILS)] },
];

@NgModule({
    declarations: [
        InvoiceListComponent,
        CreateInvoiceComponent,
        ViewInvoiceDetailsComponent,
        SelectCustomerDialogComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes)
    ],
    exports: [],
    providers: [],
})
export class InvoiceModule { }
