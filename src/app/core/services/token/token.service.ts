import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';

  salvarToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  obterToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removerToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  possuiToken(): boolean {
    return !!this.obterToken();
  }
}