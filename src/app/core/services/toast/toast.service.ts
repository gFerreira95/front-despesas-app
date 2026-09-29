import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  mensagem: string;
  tipo: 'sucesso' | 'erro' | 'aviso';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private contador = 0;

  mostrar(mensagem: string, tipo: 'sucesso' | 'erro' | 'aviso' = 'sucesso'): void {
    const id = this.contador++;
    const toast: Toast = { id, mensagem, tipo };
    
    // Adiciona o novo toast ao array atual
    const atuais = this.toastsSubject.value;
    this.toastsSubject.next([...atuais, toast]);

    // Remove automaticamente após 3.5 segundos
    setTimeout(() => this.remover(id), 3500);
  }

  remover(id: number): void {
    const atuais = this.toastsSubject.value;
    this.toastsSubject.next(atuais.filter(t => t.id !== id));
  }
}