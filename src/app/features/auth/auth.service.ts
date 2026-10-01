import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Rota API para autenticação
  private readonly API_URL = 'https://controle-despesas-api.onrender.com/api/auth/login';
  //private readonly API_URL = 'http://localhost:8080/api/auth/login'; - Para testes locais, descomente esta linha e comente a linha acima

  constructor(private http: HttpClient) {}

  login(credenciais: any): Observable<any> {
    return this.http.post(this.API_URL, credenciais);
  }
}