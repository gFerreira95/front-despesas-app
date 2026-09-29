import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Rota exata do Spring Boot configurada na etapa do back-end
  private readonly API_URL = 'https://controle-despesas-api.onrender.com/api/auth/login';

  constructor(private http: HttpClient) {}

  login(credenciais: any): Observable<any> {
    return this.http.post(this.API_URL, credenciais);
  }
}