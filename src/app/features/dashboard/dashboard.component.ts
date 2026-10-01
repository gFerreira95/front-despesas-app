import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DespesaService } from '../../core/services/despesa/despesa.service';
import { TokenService } from '../../core/services/token/token.service';
import { Despesa, FiltroDespesa } from '../../core/models/despesa.model';
import { FormularioDespesaComponent } from './components/formulario-despesa/formulario-despesa.component';
import { TabelaDespesasComponent } from './components/tabela-despesa/tabela-despesas.component';
import { IndicadoresComponent } from './components/indicadores/indicadores.component';
import { FiltroDespesasComponent } from './components/filtro-despesas/filtro-despesas.component';
import { ToastService } from '../../core/services/toast/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormularioDespesaComponent, TabelaDespesasComponent, IndicadoresComponent, FiltroDespesasComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

 
  
  // Fonte da verdade (dados brutos da API)
  despesasGlobais: Despesa[] = [];
  despesaSelecionada: Despesa | null = null;
  
  // Arrays separados para permitir filtros independentes
  despesasTabela: Despesa[] = [];
  despesasIndicadores: Despesa[] = [];
  
  // Estado dos filtros
  filtroTabelaAtivo: FiltroDespesa | null = null;
  filtroIndicadoresAtivo: FiltroDespesa | null = null;

  // Controle do Modal
  modalFiltroVisivel: boolean = false;
  contextoFiltroAtual: 'tabela' | 'indicadores' = 'tabela';
  carregando: boolean = true;

  constructor(
    private despesaService: DespesaService,
    private tokenService: TokenService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.carregarDespesas();
  }

  carregarDespesas(): void {
    this.carregando = true;
    this.despesaService.listarTodas().subscribe({
      next: (dados: any) => {
        let listaTratada: Despesa[] = [];
        if (Array.isArray(dados)) {
          listaTratada = dados;
        } else if (dados && Array.isArray(dados.content)) {
          listaTratada = dados.content;
        }
        
        this.despesasGlobais = listaTratada;
        this.sincronizarFiltros();
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.error('Erro ao carregar despesas', erro);
        this.despesasGlobais = [];
        this.sincronizarFiltros();
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  salvarDespesa(dadosFormulario: any): void {

    // Ativa o estado de carregamento antes de iniciar a requisição
    this.carregando = true; 
     
    if (this.despesaSelecionada && this.despesaSelecionada.id) {
      // MODO EDIÇÃO (PUT)
      this.despesaService.atualizar(this.despesaSelecionada.id, dadosFormulario)
      
      .pipe(
        finalize(() => {
          this.carregando = false;
        })
      )
      
      .subscribe({
        next: (despesaAtualizada) => {
          // Atualiza a despesa na lista local
          const index = this.despesasGlobais.findIndex(d => d.id === despesaAtualizada.id);
          if (index !== -1) {
            this.despesasGlobais[index] = despesaAtualizada;
          }
          this.despesaSelecionada = null; // Limpa o estado
          this.sincronizarFiltros();
          this.cdr.detectChanges();
          this.toastService.mostrar('Despesa atualizada com sucesso!', 'sucesso');
        },
        error: (erro) => {
          console.error('Erro ao atualizar', erro);
          this.toastService.mostrar('Erro ao atualizar a despesa.', 'erro');
        }
      });
    } else {
      // MODO CRIAÇÃO (POST) - (Seu código existente com os Toasts)
      this.despesaService.salvar(dadosFormulario)
      
      .pipe(
        finalize(() => {
          this.carregando = false;
        })
      )
      
      .subscribe({
        next: (novaDespesa) => {
          this.despesasGlobais.push(novaDespesa);
          this.sincronizarFiltros();  
          this.cdr.detectChanges();
          this.toastService.mostrar('Despesa salva com sucesso!', 'sucesso');
        },
        error: (erro) => {
          console.error('Erro ao salvar despesa', erro);
          this.toastService.mostrar('Erro ao guardar a despesa.', 'erro');
        }
      });
    }
  }

  excluirDespesa(id?: number): void {
    if (!id) return;
    this.despesaService.excluir(id).subscribe({
      next: () => {
        this.despesasGlobais = this.despesasGlobais.filter(d => d.id !== id);
        this.sincronizarFiltros();
        this.cdr.detectChanges();
        // Dispara o Toast
        this.toastService.mostrar('Despesa excluída com sucesso.', 'aviso');
      },
      error: (erro) => {
        console.error('Erro ao excluir despesa', erro);
        this.toastService.mostrar('Não foi possível excluir a despesa.', 'erro');
      }
    });
  }

  // --- Lógica de Filtros ---

  abrirFiltro(contexto: 'tabela' | 'indicadores'): void {
    this.contextoFiltroAtual = contexto;
    this.modalFiltroVisivel = true;
  }

  processarFiltro(evento: { contexto: 'tabela' | 'indicadores', filtro: FiltroDespesa | null }): void {
    if (evento.contexto === 'tabela') {
      this.filtroTabelaAtivo = evento.filtro;
    } else {
      this.filtroIndicadoresAtivo = evento.filtro;
    }
    this.sincronizarFiltros();
  }

  sincronizarFiltros(): void {
    this.despesasTabela = this.aplicarFiltroNoArray(this.despesasGlobais, this.filtroTabelaAtivo);
    this.despesasIndicadores = this.aplicarFiltroNoArray(this.despesasGlobais, this.filtroIndicadoresAtivo);
  }

  private aplicarFiltroNoArray(dados: Despesa[], filtro: FiltroDespesa | null): Despesa[] {
    if (!filtro) return [...dados]; // Retorna cópia da lista inteira se não houver filtro

    return dados.filter(d => {
      let passaCategoria = true;
      let passaDataInicio = true;
      let passaDataFim = true;

      if (filtro.categoria) {
        passaCategoria = d.categoria.toLowerCase().includes(filtro.categoria.toLowerCase());
      }
      if (filtro.dataInicio) {
        passaDataInicio = new Date(d.data) >= new Date(filtro.dataInicio);
      }
      if (filtro.dataFim) {
        passaDataFim = new Date(d.data) <= new Date(filtro.dataFim);
      }

      return passaCategoria && passaDataInicio && passaDataFim;
    });
  }

  // --- Lógica de Edição ---
  prepararEdicao(despesa: Despesa): void {
    // Clona o objeto para evitar binding bidirecional acidental na tabela
    this.despesaSelecionada = { ...despesa }; 
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola a página suavemente para o formulário
  }

  cancelarEdicao(): void {
    this.despesaSelecionada = null;
  }

  

  logout(): void {
    this.tokenService.removerToken();
    this.router.navigate(['/login']);
  }
}