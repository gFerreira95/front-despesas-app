import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
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
import { RouterLink } from '@angular/router'; 
import { UsuarioService } from '../../core/services/usuario/usuario.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, FormularioDespesaComponent, TabelaDespesasComponent, IndicadoresComponent, FiltroDespesasComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  private usuarioService = inject(UsuarioService);

  // Variável para armazenar a foto do perfil do usuário
  fotoPerfil: string | null = null;

  // Fonte da verdade (dados da API para o mês selecionado)
  despesasGlobais: Despesa[] = [];
  despesaSelecionada: Despesa | null = null;

  // Arrays separados para permitir filtros independentes
  despesasTabela: Despesa[] = [];
  despesasIndicadores: Despesa[] = [];

  // Estado dos filtros
  filtroTabelaAtivo: FiltroDespesa | null = null;
  filtroIndicadoresAtivo: FiltroDespesa | null = null;

  // Controle do Modal e Loading
  modalFiltroVisivel: boolean = false;
  contextoFiltroAtual: 'tabela' | 'indicadores' = 'tabela';
  carregando: boolean = true;
  isLoading: boolean = false; 

  // --- NAVEGAÇÃO MENSAL ---
  dataVisualizada = new Date(); 
  meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  constructor(
    private despesaService: DespesaService,
    private tokenService: TokenService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    // Carrega a foto do perfil do usuário
    this.usuarioService.buscarPerfil().subscribe({
      next: (perfil) => {
        if (perfil.fotoPerfilBase64) {
          this.fotoPerfil = perfil.fotoPerfilBase64;
        }
      }
    });

    // Inicia buscando apenas os dados do mês/ano atual
    this.carregarDespesasDoMes();
  }

  // --- LÓGICA DE NAVEGAÇÃO DE MESES ---

  mesAnterior(): void {
    this.dataVisualizada = new Date(this.dataVisualizada.getFullYear(), this.dataVisualizada.getMonth() - 1, 1);
    this.carregarDespesasDoMes();
  }

  proximoMes(): void {
    this.dataVisualizada = new Date(this.dataVisualizada.getFullYear(), this.dataVisualizada.getMonth() + 1, 1);
    this.carregarDespesasDoMes();
  }

  get nomeMesAtual(): string {
    return this.meses[this.dataVisualizada.getMonth()];
  }

  get anoAtual(): number {
    return this.dataVisualizada.getFullYear();
  }

  // Substitui o listarTodas pelo listarPorMes
  carregarDespesasDoMes(): void {
    this.carregando = true;
    this.cdr.detectChanges(); 

    const ano = this.dataVisualizada.getFullYear();
    const mes = this.dataVisualizada.getMonth() + 1;

    this.despesaService.listarPorMes(ano, mes)
      .pipe(
        finalize(() => {
          this.carregando = false;
          this.cdr.detectChanges(); 
        })
      )
      .subscribe({
        next: (dados: any) => {
          let listaTratada: Despesa[] = [];

          if (Array.isArray(dados)) {
            listaTratada = dados;
          } else if (dados && Array.isArray(dados.content)) {
            listaTratada = dados.content; 
          }

          this.despesasGlobais = listaTratada;
          this.sincronizarFiltros();
        },
        error: (erro) => {
          console.error('Erro ao carregar despesas', erro);
          this.despesasGlobais = [];
          this.sincronizarFiltros();
        }
      });
  }

  // --- MÉTODOS ORIGINAIS MANTIDOS INTACTOS ---

  salvarDespesa(dadosFormulario: any): void {
    this.isLoading = true;

    if (this.despesaSelecionada && this.despesaSelecionada.id) {
      this.despesaService.atualizar(this.despesaSelecionada.id, dadosFormulario)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (despesaAtualizada) => {
            const index = this.despesasGlobais.findIndex(d => d.id === despesaAtualizada.id);
            if (index !== -1) {
              this.despesasGlobais[index] = despesaAtualizada;
            }
            this.despesaSelecionada = null; 
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
      this.despesaService.salvar(dadosFormulario)
        .pipe(finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
          next: (novaDespesa) => {
            // Transformamos em string de forma segura para o TypeScript não reclamar
            // Cortamos a data (Ex: "2026-10-05") para ignorar o fuso horário do JS
            const dataString = String(novaDespesa.data).split('T')[0]; 
            const partes = dataString.split('-'); 
            
            const anoSalvo = parseInt(partes[0], 10);
            const mesSalvo = parseInt(partes[1], 10) - 1; // getMonth() no JS vai de 0 a 11

            // Só adiciona na tabela instantaneamente se a despesa pertencer ao mês que estamos a ver
            if (mesSalvo === this.dataVisualizada.getMonth() && anoSalvo === this.dataVisualizada.getFullYear()) {
                this.despesasGlobais.push(novaDespesa);
                this.sincronizarFiltros();
            }
            
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
        this.toastService.mostrar('Despesa excluída com sucesso.', 'aviso');
      },
      error: (erro) => {
        console.error('Erro ao excluir despesa', erro);
        this.toastService.mostrar('Não foi possível excluir a despesa.', 'erro');
      }
    });
  }

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
    if (!filtro) return [...dados]; 

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

  prepararEdicao(despesa: Despesa): void {
    this.despesaSelecionada = { ...despesa };
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }

  cancelarEdicao(): void {
    this.despesaSelecionada = null;
  }

  logout(): void {
    this.tokenService.removerToken();
    this.router.navigate(['/login']);
  }
}