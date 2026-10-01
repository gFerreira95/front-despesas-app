import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Despesa } from '../../../../core/models/despesa.model';

@Component({
  selector: 'app-formulario-despesa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-despesa.component.html'
})
export class FormularioDespesaComponent {
  despesaForm: FormGroup;
  // Recebe a despesa a ser editada do componente pai (Dashboard)
  @Input() despesaEmEdicao: Despesa | null = null;
  // Recebe o estado de carregamento do componente pai (Dashboard)
  @Input() carregando: boolean = false;

  // Emite os dados do formulário para o componente pai (Dashboard)
  @Output() aoSalvar = new EventEmitter<any>();
  @Output() aoCancelar = new EventEmitter<void>();

  constructor(private fb: FormBuilder) {
    this.despesaForm = this.fb.group({
      descricao: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      data: ['', Validators.required],
      categoria: ['', Validators.required]
    });
  }

  // Interceta alterações no @Input para preencher o formulário
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['despesaEmEdicao'] && this.despesaEmEdicao) {
      this.despesaForm.patchValue(this.despesaEmEdicao);
    } else if (changes['despesaEmEdicao'] && !this.despesaEmEdicao) {
      this.despesaForm.reset();
    }
  }

  submit(): void {
    if (this.despesaForm.valid) {
      this.aoSalvar.emit(this.despesaForm.value);
      this.despesaForm.reset();
    }
  }

  cancelar(): void {
    this.despesaForm.reset();
    this.aoCancelar.emit();
  }
}