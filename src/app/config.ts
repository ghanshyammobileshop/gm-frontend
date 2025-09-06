import { environment } from "environments/environment";

export const GlobalVariable = Object.freeze({
    BASE_URL: environment.API_URL,
});

export const ApiUrls = Object.freeze({
    LOGIN: `${GlobalVariable.BASE_URL}auth/login`,

    SHOP: `${GlobalVariable.BASE_URL}shop`,
    SHOP_DROPDOWN_LIST: `${GlobalVariable.BASE_URL}shop/dropdown-list`,
    SHOP_BY_ACCESS_LIST: `${GlobalVariable.BASE_URL}shop/shop-by-access-rights`,
    ALL_SHOP_LIST: `${GlobalVariable.BASE_URL}shop/findAll`,

    ADMIN_USER: `${GlobalVariable.BASE_URL}app-user`,
    ADMIN_USER_FIND_BY_ID: `${GlobalVariable.BASE_URL}app-user/findById`,
    ADMIN_USER_LIST: `${GlobalVariable.BASE_URL}app-user/findAll`,
    ADMIN_USER_ROLE_LIST: `${GlobalVariable.BASE_URL}app-user/roleList`,
    ADMIN_USER_CREATE: `${GlobalVariable.BASE_URL}adminUser/addUser`,

    CUSTOMER: `${GlobalVariable.BASE_URL}customer`,
    CUSTOMER_FIND_ALL: `${GlobalVariable.BASE_URL}customer/findAll`,

    INVOICE: `${GlobalVariable.BASE_URL}invoice`,
    INVOICE_LIST: `${GlobalVariable.BASE_URL}invoice/findAll`,
    INVOICE_BY_CUSTOMER_AND_SHOP: `${GlobalVariable.BASE_URL}invoice/findbyCustomerAndShop`,
    INVOICE_LATEST_NO_BY_SHOP_ID: `${GlobalVariable.BASE_URL}invoice/latestInvoiceNo`,
    INVOICE_PRINT: `${GlobalVariable.BASE_URL}invoice/print`,

    ACCESS_CONTROLS: `${GlobalVariable.BASE_URL}auth/accessControls`,
    ACCESS_CONTROLS_ROLE_WISE: `${GlobalVariable.BASE_URL}auth/accessControlsRoleWise`,

    LOG: `${GlobalVariable.BASE_URL}log`,
    LOG_CONSTANT: `${GlobalVariable.BASE_URL}log/constantsValues`,

    STATISTICS: `${GlobalVariable.BASE_URL}report/statistics/`,
    DB_STATS: `${GlobalVariable.BASE_URL}report/db-stats`,
});

export const StorageConst = Object.freeze({
    TOKEN: 'accessToken',
    CURRENT_USER: 'currentUser',
    CURRENT_SHOP_ACCESS: 'currentShopAccess',
});
