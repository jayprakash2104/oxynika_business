import { Injectable, inject, signal  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../constants/env';
import { API_ENDPOINTS } from '../constants/endpoint';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  role?: any;
  message: string;
  token: string;
  user?: any;
  permissions?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  isLoggingOut = signal(false);

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.baseUrl}${API_ENDPOINTS.AUTH.LOGIN}`,
      payload
    );
  }

  logout(): Observable<any> {
    return this.http.request<any>(
      'POST',
      `${environment.baseUrl}${API_ENDPOINTS.AUTH.LOGOUT}`
    );
  }

}