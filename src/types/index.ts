export interface CnaeSecundarioItem {
  codigo: string;
  descricao: string;
}

export interface CnaeAnaliseSecundario {
  cnae: string;
  desc: string;
  sindicato: string;
  regra: string;
  situacao: 'Enquadrado' | 'Consultar Especialista' | 'Fora do Perfil' | 'Outros';
  badgeClass: string;
}

export interface EnquadramentoPrincipal {
  sindicato: string;
  regra: string;
  situacao: 'Enquadrado' | 'Consultar Especialista' | 'Fora do Perfil';
  confianca: string;
  badgeClass: string;
}

export interface EmpresaConsultada {
  id: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacao: string;
  dataAbertura: string;
  porte: string;
  socios: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  enderecoCompleto: string;
  cnaePrincipal: {
    code: string;
    rawCode: string;
    desc: string;
    enquadramento: EnquadramentoPrincipal;
  };
  cnaesSecundarios: CnaeAnaliseSecundario[];
  isIndustry: boolean;
  avisoOffline?: boolean;
}

export interface SindicatoItem {
  sigla: string;
  nome: string;
  ambito: string;
  abrang: string;
  cnaes: string;
}

export type TabType = 'triagem' | 'catalogo' | 'regras';
