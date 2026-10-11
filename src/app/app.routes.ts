import { Routes } from '@angular/router';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { SubAdminListComponent } from './pages/sub-admin/sub-admin-list/sub-admin-list.component';
import { SubAdminDetailsComponent } from './pages/sub-admin/sub-admin-details/sub-admin-details.component';
import { authGuard } from './core/guards/auth.guard';
import { BdoListComponent } from './pages/bdo/bdo-list/bdo-list.component';
import { BdoDetailsComponent } from './pages/bdo/bdo-details/bdo-details.component';
import { PackagesComponent } from './pages/packages/packages.component';
import { EncryptionComponent } from './pages/encryption/encryption.component';
import { ActivationRequestsComponent } from './pages/activation-requests/activation-requests.component';

export const routes: Routes = [
   {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full',
  },
  {
    path:'',
    component:AppLayoutComponent,
    canActivate: [authGuard],
    children:[
      {
        path: 'dashboard',
        component: EcommerceComponent,
        pathMatch: 'full',
        title:
          'Ecommerce Dashboard | Oxynika',
      },
      {
        path:'calendar',
        component:CalenderComponent,
        title:'Calender | Oxynika'
      },
      {
        path:'sub-admins',
        component:SubAdminListComponent,
        title:'Sub-Admin List | Oxynika'
      },
      {
        path:'sub-admin-details',
        component:SubAdminDetailsComponent,
        title:'Sub-Admin Details | Oxynika'
      },
      {
        path:'bdo',
        component:BdoListComponent,
        title:'BDO List | Oxynika'
      },
      {
        path:'bdo-details',
        component:BdoDetailsComponent,
        title:'BDO Details | Oxynika'
      },
      {
        path:'packages',
        component:PackagesComponent,
        title:'Packages | Oxynika'
      },
      {
        path:'activation-requests',
        component:ActivationRequestsComponent,
        title:'Package Activation | Oxynika'
      },
      {
        path:'encryption',
        component:EncryptionComponent,
        title:'Encryption | Oxynika'
      },
      {
        path:'profile',
        component:ProfileComponent,
        title:'Profile Dashboard | Oxynika'
      },
      {
        path: 'sub-admin',
        component: ProfileComponent,
        title: 'Sub Admin Details'
      },
      {
        path:'form-elements',
        component:FormElementsComponent,
        title:'Form Elements Dashboard | Oxynika'
      },
      {
        path:'basic-tables',
        component:BasicTablesComponent,
        title:'Basic Tables Dashboard | Oxynika'
      },
      {
        path:'blank',
        component:BlankComponent,
        title:'Blank Dashboard | Oxynika'
      },
      // support tickets
      {
        path:'invoice',
        component:InvoicesComponent,
        title:'Invoice Details Dashboard | Oxynika'
      },
      {
        path:'line-chart',
        component:LineChartComponent,
        title:'Line Chart Dashboard | Oxynika'
      },
      {
        path:'bar-chart',
        component:BarChartComponent,
        title:'Bar Chart Dashboard | Oxynika'
      },
      {
        path:'alerts',
        component:AlertsComponent,
        title:'Alerts Dashboard | Oxynika'
      },
      {
        path:'avatars',
        component:AvatarElementComponent,
        title:'Avatars Dashboard | Oxynika'
      },
      {
        path:'badge',
        component:BadgesComponent,
        title:'Badges Dashboard | Oxynika'
      },
      {
        path:'buttons',
        component:ButtonsComponent,
        title:'Buttons Dashboard | Oxynika'
      },
      {
        path:'images',
        component:ImagesComponent,
        title:'Images Dashboard | Oxynika'
      },
      {
        path:'videos',
        component:VideosComponent,
        title:'Videos Dashboard | Oxynika'
      },
    ]
  },
  // auth pages
  {
    path:'signin',
    component:SignInComponent,
    title:'Sign In | Oxynika Wellness'
  },
  {
    path:'signup',
    component:SignUpComponent,
    title:'Sign Up Dashboard | Oxynika'
  },
  // error pages
  {
    path:'**',
    component:NotFoundComponent,
    title:'NotFound Dashboard | Oxynika'
  },
];
