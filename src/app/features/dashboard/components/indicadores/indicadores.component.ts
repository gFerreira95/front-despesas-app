import { Component, inject, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Despesa } from '../../../../core/models/despesa.model';
import { UsuarioService, Perfil } from '../../../../core/services/usuario/usuario.service';

@Component({
  selector: 'app-indicadores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indicadores.component.html'
})
export class IndicadoresComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  

  @Input() despesas: Despesa[] = [];
  @Input() carregando: boolean = false;

  rendaBruta: number = 0;
  limiteGastos: number = 0;
  

  ngOnInit(): void {
    this.usuarioService.buscarPerfil().subscribe({
      next: (perfil: Perfil) => {
        this.rendaBruta = perfil.rendaMensalBruta || 0;
        this.limiteGastos = perfil.limiteGastos || 0;
      }
    });
  }

  // 1. Calcula o total gasto com base na lista de despesas que o Dashboard lhe entregou
  get totalGasto(): number {
    return this.despesas.reduce((acc, despesa) => acc + (despesa.valor || 0), 0);
  }

  // 2. Agora aponta para o getter "totalGasto" acima para abater a sobra corretamente
  get sobra(): number {
    return this.rendaBruta - this.totalGasto;
  }

  // 3. Compara com o total calculado (e previne alertas falsos se não houver limite salvo)
  get passouLimite(): boolean {
    if (this.limiteGastos === 0) return false;
    return this.totalGasto > this.limiteGastos;
  }


  get maiorDespesa(): number {
    if (this.despesas.length === 0) return 0;
    return Math.max(...this.despesas.map(d => d.valor || 0));
  }


  get quantidadeLancamentos(): number {
    return this.despesas.length;
  }
}