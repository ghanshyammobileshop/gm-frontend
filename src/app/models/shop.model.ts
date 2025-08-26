import { InvoiceTypeEnum } from "./enums/invoice.enum";
import { User } from "./user";

export interface ShopDropdownList {
    id: string;
    name: string;
}

export interface Shop {
    id: string;
    name: string;
    invoiceType: InvoiceTypeEnum;
    cgst: number;
    sgst: number;
    gstNo: string;
    invoicePrefix: string;
    termsAndConditions: string;
    description: string;
    active: boolean;
    createdBy: User;
    updatedBy: User;
}