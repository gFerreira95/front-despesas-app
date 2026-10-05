import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DespesaService, ResumoGastos } from '../../core/services/despesa/despesa.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-metricas',
  standalone: true,
  // A BaseChartDirective é injetada aqui para permitir o uso da tag <canvas baseChart> no HTML
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './metricas.component.html',
  styleUrls: ['./metricas.component.scss']
})
export class MetricasComponent implements OnInit {
  private despesaService = inject(DespesaService);

  carregando = true;

  meses = [
    { valor: 1, nome: 'Janeiro' }, { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' }, { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' }, { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' }, { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' }, { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' }, { valor: 12, nome: 'Dezembro' }
  ];
  
  anos = [2024, 2025, 2026, 2027];

  // Configurações do Mês Principal (Análise de Categorias)
  mesPrincipal = new Date().getMonth() + 1;
  anoPrincipal = new Date().getFullYear();

  // Configurações do Mês de Comparação (Por defeito, o mês anterior)
  mesComparacao = this.mesPrincipal === 1 ? 12 : this.mesPrincipal - 1;
  anoComparacao = this.mesPrincipal === 1 ? this.anoPrincipal - 1 : this.anoPrincipal;

  // Dados para o Gráfico de Barras (Comparação de Totais)
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Comparativo de Gastos Totais' }
    }
  };
  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  // Dados para o Gráfico de Doughnut (Categorias do Mês Principal)
  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      title: { display: true, text: 'Distribuição por Categoria (Mês Principal)' },
      datalabels: {
        color: '#ffffff',
        font: { weight: 'bold', size: 14 },
        formatter: (value: any, ctx: any) => {
          const dataset = ctx.chart.data.datasets[0].data;
          const total = dataset.reduce((acc: number, curr: number) => acc + curr, 0);
          
          if (total === 0 || value === 0) return ''; 
          
          return ((value * 100) / total).toFixed(1) + '%';
        }
      }
    }
  };

  doughnutChartPlugins = [ChartDataLabels];
  doughnutChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;

    // Dispara as duas chamadas ao mesmo tempo para máxima performance
    forkJoin({
      principal: this.despesaService.obterEstatisticas(this.anoPrincipal, this.mesPrincipal),
      comparacao: this.despesaService.obterEstatisticas(this.anoComparacao, this.mesComparacao)
    })
    .pipe(finalize(() => this.carregando = false))
    .subscribe({
      next: (resultado) => {
        this.montarGraficoComparacao(resultado.principal, resultado.comparacao);
        this.montarGraficoCategorias(resultado.principal);
      },
      error: (err) => console.error('Erro ao buscar estatísticas para gráficos', err)
    });
  }

  private montarGraficoComparacao(resPrincipal: ResumoGastos, resComparacao: ResumoGastos): void {
    const nomeMesPrincipal = this.meses.find(m => m.valor === this.mesPrincipal)?.nome;
    const nomeMesComparacao = this.meses.find(m => m.valor === this.mesComparacao)?.nome;

    this.barChartData = {
      labels: [`${nomeMesComparacao}/${this.anoComparacao}`, `${nomeMesPrincipal}/${this.anoPrincipal}`],
      datasets: [
        {
          data: [resComparacao.totalMes || 0, resPrincipal.totalMes || 0],
          backgroundColor: ['#9CA3AF', '#3B82F6'], // Cinza para o mês antigo, Azul para o atual
          borderRadius: 4
        }
      ]
    };
  }

  private montarGraficoCategorias(resPrincipal: ResumoGastos): void {
    const categorias = resPrincipal.gastosPorCategoria || {};
    const labels = Object.keys(categorias);
    const data = Object.values(categorias);

    this.doughnutChartData = {
      labels: labels.length > 0 ? labels : ['Sem dados'],
      datasets: [
        {
          data: data.length > 0 ? data : [1],
          backgroundColor: data.length > 0 ? 
            ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'] : 
            ['#e5e7eb'], // Cor cinza caso não haja dados
          hoverOffset: 4
        }
      ]
    };
  }
}