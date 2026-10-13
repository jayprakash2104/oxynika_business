import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../constants/env';
import { API_ENDPOINTS } from '../constants/endpoint';

@Injectable({
  providedIn: 'root'
})

export class CommonService {

  private http = inject(HttpClient);

  getMenuItems(): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}${API_ENDPOINTS.MENU.GET_MENU_ITEMS}`
    );
  }

  getSubAdminList(): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}${API_ENDPOINTS.USER.SUB_ADMIN.SUB_ADMIN_LIST}`
    );
  }

  getBdoList(): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}${API_ENDPOINTS.USER.BDO.BDO_LIST}`
    );
  }

  getPackageList(): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}${API_ENDPOINTS.PACKAGE.PACKAGE_LIST}`
    );
  }

  getSubAdminDetails(id: number | string): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}${API_ENDPOINTS.USER.SUB_ADMIN.SUB_ADMIN_DETAILS}/${id}`
    );
  }

  getBdoDetails(id: number | string): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}${API_ENDPOINTS.USER.BDO.BDO_DETAILS}/${id}`
    );
  }
  

  updateBdo(){

  }

  getPermissions(): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}${API_ENDPOINTS.USER.ADMIN.PERMISSONS}`
    );
  }

  createSubAdmin(payload: any): Observable<any>{
    return this.http.post<any>(
      `${environment.baseUrl}${API_ENDPOINTS.USER.SUB_ADMIN.SUB_ADMIN_CREATE}`,
      payload
    );  
  }

    createBdo(payload: any): Observable<any>{
    return this.http.post<any>(
      `${environment.baseUrl}${API_ENDPOINTS.USER.BDO.BDO_CREATE}`,
      payload
    );  
  }

  createPackage(payload: any): Observable<any>{
    return this.http.post<any>(
      `${environment.baseUrl}${API_ENDPOINTS.PACKAGE.PACKAGE_LIST}`,
      payload
    );  
  }

  updatePackage(id: any, payload: any): Observable<any>{
    return this.http.put<any>(
      `${environment.baseUrl}${API_ENDPOINTS.PACKAGE.PACKAGE_LIST}/${id}`,
      payload
    );  
  }

  deletePackage(id: any): Observable<any>{
    return this.http.delete<any>(
      `${environment.baseUrl}${API_ENDPOINTS.PACKAGE.PACKAGE_LIST}/${id}`
    );  
  }

  updateSubAdmin(id: number | string, payload: any): Observable<any> {
    return this.http.put<any>(
      `${environment.baseUrl}${API_ENDPOINTS.USER.SUB_ADMIN.SUB_ADMIN_UPDATE}/${id}`,
      payload
    );
  }

  activatePackage(packageId: number): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrl}${API_ENDPOINTS.PACKAGE.ACTIVATE_PACKAGE}`,
      { package_id: packageId }
    );  
  }

  getRequestedPackage(): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}${API_ENDPOINTS.PACKAGE.BDO_PACKAGE_LIST}`
    );
  }

  getRequestedPackageByBDO(): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}${API_ENDPOINTS.PACKAGE.REQUESTED_PACKAGE}`
    );
  }

  approveRequestedPackage(id: number): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrl}${API_ENDPOINTS.PACKAGE.REQUESTED_PACKAGE}/${id}/approve`,
      {}
    );
  }

  rejectRequestedPackage(id: number): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrl}${API_ENDPOINTS.PACKAGE.REQUESTED_PACKAGE}/${id}/reject`,
      {}
    );
  }

  getWalletBalance(): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}${API_ENDPOINTS.USER.BDO.WALLET_DETAILS}`
    );
  }

  getTransactionHistory(): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}${API_ENDPOINTS.USER.BDO.TRANSACTION_HISTORY}`
    );
  }

userRegistration( payload: any, referralCode: string ): Observable<any> {
  return this.http.post<any>(
    `${environment.baseUrl}${API_ENDPOINTS.USER.BDO.USER_REGISTRATION}?ref=${encodeURIComponent(referralCode)}`,
    payload
  );
}
}