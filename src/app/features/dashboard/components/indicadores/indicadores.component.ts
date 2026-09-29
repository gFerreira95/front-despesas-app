import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Despesa } from '../../../../core/models/despesa.model';

@Component({
  selector: 'app-indicadores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indicadores.component.html'
})
export class IndicadoresComponent {
  @Input() despesas: Despesa[] = [];

  get totalGasto(): number {
    return this.despesas.reduce((acc, despesa) => acc + (despesa.valor || 0), 0);
  }

  get maiorDespesa(): number {
    if (this.despesas.length === 0) return 0;
    return Math.max(...this.despesas.map(d => d.valor || 0));
  }

  get quantidadeLancamentos(): number {
    return this.despesas.length;
  }
}