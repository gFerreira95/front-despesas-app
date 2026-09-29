import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FiltroDespesa } from '../../../../core/models/despesa.model';

@Component({
  selector: 'app-filtro-despesas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filtro-despesas.component.html'
})
export class FiltroDespesasComponent {
  @Input() visivel: boolean = false;
  @Input() contexto: 'tabela' | 'indicadores' = 'tabela';
  
  @Output() aoAplicar = new EventEmitter<{ contexto: 'tabela' | 'indicadores', filtro: FiltroDespesa | null }>();
  @Output() aoFechar = new EventEmitter<void>();

  filtroForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filtroForm = this.fb.group({
      categoria: [''],
      dataInicio: [''],
      dataFim: ['']
    });
  }

  aplicarFiltro(): void {
    this.aoAplicar.emit({ contexto: this.contexto, filtro: this.filtroForm.value });
    this.fechar();
  }

  limparFiltro(): void {
    this.filtroForm.reset();
    this.aoAplicar.emit({ contexto: this.contexto, filtro: null });
    this.fechar();
  }

  fechar(): void {
    this.aoFechar.emit();
  }
}