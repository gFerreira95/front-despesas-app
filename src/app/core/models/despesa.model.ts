export interface Despesa {
  id?: number;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
}

export interface FiltroDespesa {
  categoria?: string;
  dataInicio?: string;
  dataFim?: string;
}