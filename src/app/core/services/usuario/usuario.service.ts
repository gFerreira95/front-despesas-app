import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Perfil {
  rendaMensalBruta: number;
  limiteGastos: number;
  fotoPerfilBase64: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  
  // Utilizando a URL direta do Render conforme o padrão atual do seu projeto
  private apiUrl = 'https://controle-despesas-api.onrender.com/api/usuarios/perfil';

  buscarPerfil(): Observable<Perfil> {
    return this.http.get<Perfil>(this.apiUrl);
  }

  atualizarPerfil(perfil: Perfil): Observable<Perfil> {
    return this.http.put<Perfil>(this.apiUrl, perfil);
  }
}