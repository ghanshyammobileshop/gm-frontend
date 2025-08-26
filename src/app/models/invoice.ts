import { Customer } from "./customer";
import { InvoiceTypeEnum } from "./enums/invoice.enum";
import { Shop } from "./shop.model";
import { User } from "./user";

export interface Invoice {
    invoiceNo: string;
    invoiceDate: Date;
    subTotal: number;
    sgstTotal: number;
    cgstTotal: number;
    invoiceTotal: number;
    customerId: string;
    shopId: string;
    id: string;
    createdBy: User;
    updatedBy: User;
    createdAt: Date;
    updatedAt: Date;
    companyName: string;
    modelNo: string;
    serialNo1: string;
    serialNo2: string;
    hsnCode: string;
    quantity: number;
    price: number;
    total: number;
    shopInfo: Shop;
    customerInfo: Customer;
    invoiceType: InvoiceTypeEnum;
    invoicePrefix: string;
}