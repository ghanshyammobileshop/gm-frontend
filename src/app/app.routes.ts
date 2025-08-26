import { Routes } from '@angular/router';
import { AccessControls } from './const';
import { AccessGuard } from './guards/access.guard';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/noAuth.guard';
import { EmptyLayoutComponent } from './layouts/empty-layout/empty-layout.component';
import { LayoutComponent } from './layouts/layout/layout.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'sign-in'
    },
    {
        path: 'signed-in-redirect',
        pathMatch: 'full',
        redirectTo: 'dashboard'
    },
    // Auth routes
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: EmptyLayoutComponent,
        children: [
            { path: 'confirmation-required', loadChildren: () => import('./auth/confirmation-required/confirmation-required.routes') },
            { path: 'forgot-password', loadChildren: () => import('./auth/forgot-password/forgot-password.routes') },
            { path: 'reset-password', loadChildren: () => import('./auth/reset-password/reset-password.routes') },
            { path: 'sign-in', loadChildren: () => import('./auth/sign-in/sign-in.routes') },
            { path: 'sign-up', loadChildren: () => import('./auth/sign-up/sign-up.routes') },
            { path: 'sign-out', loadChildren: () => import('./auth/sign-out/sign-out.routes') },

            // components
            { path: 'maintenance', loadChildren: () => import('./components/maintenance/maintenance.component') },
            { path: 'error', loadChildren: () => import('./components/error/error.component') },
        ]
    },

    // other routes
    {
        path: 'dashboard',
        canActivate: [AuthGuard, AccessGuard(AccessControls.DASHBOARD_VIEW)],
        canActivateChild: [AuthGuard, AccessGuard(AccessControls.DASHBOARD_VIEW)],
        component: LayoutComponent,
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
        path: 'admin-user',
        canActivate: [AuthGuard, AccessGuard(AccessControls.USER_READ_LIST)],
        canActivateChild: [AuthGuard, AccessGuard(AccessControls.USER_READ_LIST)],
        component: LayoutComponent,
        loadChildren: () => import('./modules/admin-user/admin-user.module').then(m => m.AdminUserModule)
    },
    {
        path: 'customer',
        canActivate: [AuthGuard, AccessGuard(AccessControls.CUSTOMER_READ_LIST)],
        canActivateChild: [AuthGuard, AccessGuard(AccessControls.CUSTOMER_READ_LIST)],
        component: LayoutComponent,
        loadChildren: () => import('./modules/customer/customer.module').then(m => m.CustomerModule)
    },
    {
        path: 'invoice',
        canActivate: [AuthGuard, AccessGuard([AccessControls.INVOICE_READ_LIST])],
        canActivateChild: [AuthGuard, AccessGuard([AccessControls.INVOICE_READ_LIST])],
        component: LayoutComponent,
        loadChildren: () => import('./modules/invoice/invoice.module').then(m => m.InvoiceModule)
    },
    {
        path: 'shop',
        canActivate: [AuthGuard, AccessGuard(AccessControls.SHOP_READ_LIST)],
        canActivateChild: [AuthGuard, AccessGuard(AccessControls.SHOP_READ_LIST)],
        component: LayoutComponent,
        loadChildren: () => import('./modules/shop/shop.module').then(m => m.ShopModule)
    },
    {
        path: 'log-report',
        canActivate: [AuthGuard, AccessGuard(AccessControls.LOG_READ_ALL)],
        canActivateChild: [AuthGuard, AccessGuard(AccessControls.LOG_READ_ALL)],
        component: LayoutComponent,
        loadChildren: () => import('./modules/log-report/log-report.module').then(m => m.LogReportModule)
    },
    {
        path: '**',
        component: EmptyLayoutComponent,
        data: {
            layout: 'empty'
        },
        loadChildren: () => import('./components/error/error.component')
    },
];
