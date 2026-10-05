import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry } from 'rxjs';
import { Despesa } from '../../models/despesa.model';

export interface ResumoGastos {
  totalMes: number;
  gastosPorCategoria: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class DespesaService {
  // Rota correspondente ao controlador de despesas no Spring Boot
  private readonly API_URL = 'https://controle-despesas-api.onrender.com/api/despesas';
  //private readonly API_URL = 'http://localhost:8080/api/despesas'; - Para testes locais, descomente esta linha e comente a linha acima

  constructor(private http: HttpClient) {}

  listarTodas(): Observable<Despesa[]> {
    return this.http.get<Despesa[]>(this.API_URL).pipe(retry(3));
  }

  salvar(despesa: Despesa): Observable<Despesa> {
    return this.http.post<Despesa>(this.API_URL, despesa).pipe(retry(3));
  }


  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(retry(3));
  }

  atualizar(id: number, despesa: Despesa): Observable<Despesa> {
    return this.http.put<Despesa>(`${this.API_URL}/${id}`, despesa).pipe(retry(3)); // Tenta novamente até 3 vezes em caso de falha
  }


  listarPorMes(ano: number, mes: number): Observable<Despesa[]> {
    // Cria um carimbo de tempo para enganar o cache do navegador
    const timestamp = new Date().getTime();
    
    // Adicionamos o &t=timestamp no final da requisição
    return this.http.get<Despesa[]>(`${this.API_URL}/mes?ano=${ano}&mes=${mes}&t=${timestamp}`).pipe(retry(3));
  }

  obterEstatisticas(ano: number, mes: number): Observable<ResumoGastos> {
    const timestamp = new Date().getTime();
    return this.http.get<ResumoGastos>(`${this.API_URL}/estatisticas?ano=${ano}&mes=${mes}&t=${timestamp}`).pipe(retry(3));
  }

  
}