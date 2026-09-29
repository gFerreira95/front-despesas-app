import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Despesa } from '../../models/despesa.model';

@Injectable({
  providedIn: 'root'
})
export class DespesaService {
  // Rota correspondente ao controlador de despesas no Spring Boot
  private readonly API_URL = 'http://localhost:8080/api/despesas';

  constructor(private http: HttpClient) {}

  listarTodas(): Observable<Despesa[]> {
    return this.http.get<Despesa[]>(this.API_URL);
  }

  salvar(despesa: Despesa): Observable<Despesa> {
    return this.http.post<Despesa>(this.API_URL, despesa);
  }


  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  atualizar(id: number, despesa: Despesa): Observable<Despesa> {
    return this.http.put<Despesa>(`${this.API_URL}/${id}`, despesa);
  }
}