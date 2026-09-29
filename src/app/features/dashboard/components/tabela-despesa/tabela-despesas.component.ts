import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Despesa } from '../../../../core/models/despesa.model';

@Component({
  selector: 'app-tabela-despesas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabela-despesas.component.html',
})
export class TabelaDespesasComponent {
  @Input() despesas: Despesa[] = [];
  @Input() carregando: boolean = false;

  @Output() aoExcluir = new EventEmitter<number>();
  @Output() aoEditar = new EventEmitter<Despesa>(); 

  excluir(id?: number): void {
    if (id) {
      this.aoExcluir.emit(id);
    }
  }

  editar(despesa: Despesa): void {
    this.aoEditar.emit(despesa);
  }
  
}