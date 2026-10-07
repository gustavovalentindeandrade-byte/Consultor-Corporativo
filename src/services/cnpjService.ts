import { EmpresaConsultada } from '../types';
import { cleanNumber, baseCNAEs, enquadrarPrincipal, analisarSecundarios } from '../data/firjanRules';

export const MOCKS_OFFLINE: Record<string, any> = {
  '33000167000101': {
    cnpj: '33000167000101',
    razao_social: 'PETROLEO BRASILEIRO S A PETROBRAS',
    nome_fantasia: 'PETROBRAS',
    descricao_situacao_cadastral: 'ATIVA',
    data_inicio_atividade: '1953-10-03',
    porte: 'DEMAIS',
    logradouro: 'AVENIDA REPUBLICA DO CHILE',
    numero: '65',
    complemento: 'ANDAR 20 A 23',
    bairro: 'CENTRO',
    municipio: 'RIO DE JANEIRO',
    uf: 'RJ',
    cep: '20031170',
    cnae_fiscal: '0600003',
    cnae_fiscal_descricao: 'Extração de areias betuminosas',
    cnaes_secundarios: [
      { codigo: '1921700', descricao: 'Fabricação de produtos do refino de petróleo' },
      { codigo: '1922501', descricao: 'Formulação de combustíveis' },
      { codigo: '4681801', descricao: 'Comércio atacadista de combustíveis' }
    ],
    qsa: [{ nome_socio: 'Magda Maria de Regina Chambriard' }]
  },
  '00000000000191': {
    cnpj: '00000000000191',
    razao_social: 'BANCO DO BRASIL SA',
    nome_fantasia: 'DIRECAO GERAL',
    descricao_situacao_cadastral: 'ATIVA',
    data_inicio_atividade: '1966-08-01',
    porte: 'DEMAIS',
    logradouro: 'SAUN QUADRA 5 LOTE B',
    numero: 'SN',
    complemento: 'TORRES I II E III',
    bairro: 'ASA NORTE',
    municipio: 'BRASILIA',
    uf: 'DF',
    cep: '70040912',
    cnae_fiscal: '6422100',
    cnae_fiscal_descricao: 'Bancos múltiplos, com carteira comercial',
    cnaes_secundarios: [],
    qsa: [{ nome_socio: 'Tarciana Paula Gomes Medeiros' }]
  },
  '12345678000199': {
    cnpj: '12345678000199',
    razao_social: 'PADARIA E CONFEITARIA MODELO DE NITEROI LTDA',
    nome_fantasia: 'PADARIA MODELO',
    descricao_situacao_cadastral: 'ATIVA',
    data_inicio_atividade: '2018-05-10',
    porte: 'MICRO EMPRESA',
    logradouro: 'RUA CORONEL MOREIRA CESAR',
    numero: '120',
    complemento: 'LOJA A',
    bairro: 'ICARAI',
    municipio: 'NITEROI',
    uf: 'RJ',
    cep: '24230062',
    cnae_fiscal: '1091101',
    cnae_fiscal_descricao: 'Fabricação de produtos de panificação industrial',
    cnaes_secundarios: [
      { codigo: '4721102', descricao: 'Padaria e confeitaria com predominância de revenda' },
      { codigo: '4711302', descricao: 'Comércio varejista de mercadorias em geral' }
    ],
    qsa: [{ nome_socio: 'Antonio Carlos Pereira' }]
  },
  '28123456000177': {
    cnpj: '28123456000177',
    razao_social: 'METALURGICA E CONSTRUCOES CAXIAS LTDA',
    nome_fantasia: 'METAL CAXIAS',
    descricao_situacao_cadastral: 'ATIVA',
    data_inicio_atividade: '2015-03-20',
    porte: 'EMPRESA DE PEQUENO PORTE',
    logradouro: 'RODOVIA WASHINGTON LUIZ',
    numero: '4500',
    complemento: 'GALPAO 3',
    bairro: 'CHACARAS RIO-PETROPOLIS',
    municipio: 'DUQUE DE CAXIAS',
    uf: 'RJ',
    cep: '25050009',
    cnae_fiscal: '2539001',
    cnae_fiscal_descricao: 'Serviços de usinagem, tornearia e solda',
    cnaes_secundarios: [
      { codigo: '4120400', descricao: 'Construção de edifícios' },
      { codigo: '2511000', descricao: 'Fabricação de estruturas metálicas' }
    ],
    qsa: [{ nome_socio: 'Carlos Eduardo Silva' }]
  },
  '04123456000188': {
    cnpj: '04123456000188',
    razao_social: 'INDUSTRIA NOROESTE DE ALIMENTOS E EMBALAGENS LTDA',
    nome_fantasia: 'NOROESTE ALIMENTOS',
    descricao_situacao_cadastral: 'ATIVA',
    data_inicio_atividade: '2012-11-15',
    porte: 'DEMAIS',
    logradouro: 'AVENIDA CARDOSO MOREIRA',
    numero: '850',
    complemento: '',
    bairro: 'CENTRO',
    municipio: 'ITAPERUNA',
    uf: 'RJ',
    cep: '28300000',
    cnae_fiscal: '1099699',
    cnae_fiscal_descricao: 'Fabricação de outros produtos alimentícios não especificados anteriormente',
    cnaes_secundarios: [
      { codigo: '1813001', descricao: 'Impressão de material para outros usos' },
      { codigo: '2599399', descricao: 'Fabricação de outros produtos de metal' }
    ],
    qsa: [{ nome_socio: 'Fernando Rocha' }]
  },
  '27865757000102': {
    cnpj: '27865757000102',
    razao_social: 'CONFECCOES SUL FLUMINENSE LTDA',
    nome_fantasia: 'MODA SUL',
    descricao_situacao_cadastral: 'ATIVA',
    data_inicio_atividade: '2017-02-14',
    porte: 'MICRO EMPRESA',
    logradouro: 'RUA ALBINO DE ALMEIDA',
    numero: '150',
    complemento: '',
    bairro: 'CAMPOS ELISEOS',
    municipio: 'RESENDE',
    uf: 'RJ',
    cep: '27542010',
    cnae_fiscal: '1412601',
    cnae_fiscal_descricao: 'Confecção de peças do vestuário, exceto roupas íntimas',
    cnaes_secundarios: [],
    qsa: [{ nome_socio: 'Juliana Mendes' }]
  }
};

export const EXEMPLOS_CNPJ = [
  '33.000.167/0001-01', // Petrobras (RJ Capital)
  '00.000.000/0001-91', // Banco do Brasil (Fora do Perfil)
  '12.345.678/0001-99', // Padaria Modelo (Niterói)
  '28.123.456/0001-77', // Metalúrgica Caxias (Baixada)
  '27.865.757/0001-02', // Confecções Sul Fluminense (Resende - Especialista)
  '04.123.456/0001-88'  // Alimentos Itaperuna (Noroeste)
];

export async function buscarDadosCnpjComFallback(cnpj: string): Promise<any> {
  const clean = cleanNumber(cnpj);

  // 1. Verificar banco de testes instantâneo
  if (MOCKS_OFFLINE[clean]) {
    return MOCKS_OFFLINE[clean];
  }

  // 2. Tentar BrasilAPI
  try {
    const c1 = new AbortController();
    const t1 = setTimeout(() => c1.abort(), 4500);
    const res1 = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, {
      signal: c1.signal
    });
    clearTimeout(t1);
    if (res1.ok) {
      return await res1.json();
    }
  } catch (e) {
    console.warn('BrasilAPI não respondeu ou com timeout, tentando alternativa...', e);
  }

  // 3. Tentar Pública CNPJ.ws
  try {
    const c2 = new AbortController();
    const t2 = setTimeout(() => c2.abort(), 4500);
    const res2 = await fetch(`https://publica.cnpj.ws/cnpj/${clean}`, {
      signal: c2.signal
    });
    clearTimeout(t2);
    if (res2.ok) {
      const d = await res2.json();
      return {
        cnpj: clean,
        razao_social: d.razao_social || 'Razão Social Consultada',
        nome_fantasia: d.estabelecimento?.nome_fantasia || d.razao_social || 'Não informado',
        descricao_situacao_cadastral: d.estabelecimento?.situacao_cadastral || 'ATIVA',
        data_inicio_atividade: d.estabelecimento?.data_inicio_atividade || 'Não informada',
        porte: d.porte?.descricao || 'DEMAIS',
        logradouro: d.estabelecimento?.logradouro || 'Não informado',
        numero: d.estabelecimento?.numero || 'S/N',
        complemento: d.estabelecimento?.complemento || '',
        bairro: d.estabelecimento?.bairro || 'Não informado',
        municipio: d.estabelecimento?.cidade?.nome || 'Rio de Janeiro',
        uf: d.estabelecimento?.estado?.sigla || 'RJ',
        cep: d.estabelecimento?.cep || 'Não informado',
        cnae_fiscal: d.estabelecimento?.atividade_principal?.subclasse || '0000000',
        cnae_fiscal_descricao: d.estabelecimento?.atividade_principal?.descricao || 'Atividade Econômica',
        cnaes_secundarios: (d.estabelecimento?.atividades_secundarias || []).map((s: any) => ({
          codigo: s.subclasse,
          descricao: s.descricao
        })),
        qsa: (d.socios || []).map((s: any) => ({ nome_socio: s.nome }))
      };
    }
  } catch (e) {
    console.warn('CNPJ.ws alternativo também indisponível.', e);
  }

  // 4. Fallback resiliente
  return {
    cnpj: clean,
    razao_social: `EMPRESA CONSULTADA (CNPJ ${clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')})`,
    nome_fantasia: 'NÃO DISPONÍVEL NA CONSULTA ON-LINE',
    descricao_situacao_cadastral: 'ATIVA (ESTIMADA)',
    data_inicio_atividade: 'Data não recuperada',
    porte: 'DEMAIS',
    logradouro: 'Endereço cadastrado na RFB',
    numero: 'S/N',
    complemento: '',
    bairro: 'Centro',
    municipio: 'Rio de Janeiro',
    uf: 'RJ',
    cep: '20000-000',
    cnae_fiscal: '2511000',
    cnae_fiscal_descricao: 'Fabricação de estruturas metálicas (Padrão para demonstração)',
    cnaes_secundarios: [
      { codigo: '4120400', descricao: 'Construção de edifícios' }
    ],
    qsa: [{ nome_socio: 'Quadro de sócios acessível no cartão CNPJ' }],
    avisoOffline: true
  };
}

export function formatarEmpresaConsultada(data: any, index: number): EmpresaConsultada {
  const cnpjClean = cleanNumber(data.cnpj);
  const cnpjFormatado = cnpjClean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

  const logradouro = data.logradouro || 'Não informado';
  const numero = data.numero || 'S/N';
  const complemento = data.complemento || '';
  const bairro = data.bairro || 'Não informado';
  const municipio = data.municipio || 'Rio de Janeiro';
  const uf = data.uf || 'RJ';
  const cepRaw = cleanNumber(data.cep);
  const cepFormatado = cepRaw.length === 8 ? cepRaw.replace(/^(\d{5})(\d{3})$/, '$1-$2') : data.cep || 'Não informado';
  const enderecoCompleto = `${logradouro}, ${numero}${complemento ? ' - ' + complemento : ''} - ${bairro}, ${municipio} - ${uf}, CEP: ${cepFormatado}`;

  const cnaePrincipalCode = String(data.cnae_fiscal || '0000000').padStart(7, '0');
  const cnaePrincipalDesc =
    data.cnae_fiscal_descricao ||
    (baseCNAEs[cleanNumber(cnaePrincipalCode)] ? baseCNAEs[cleanNumber(cnaePrincipalCode)].desc : 'Sem descrição cadastrada');
  const enquadramentoPrincipal = enquadrarPrincipal(cnaePrincipalCode, cnaePrincipalDesc, municipio, uf);

  const cnaesSecundariosRaw = data.cnaes_secundarios && Array.isArray(data.cnaes_secundarios) ? data.cnaes_secundarios : [];
  const analiseSecundarios = analisarSecundarios(cnaesSecundariosRaw, municipio, uf);

  const sociosStr =
    data.qsa && Array.isArray(data.qsa) && data.qsa.length > 0
      ? data.qsa.map((s: any) => s.nome_socio || s.nome).join(', ')
      : 'Quadro societário não informado';

  const divPrincipal = parseInt(cleanNumber(cnaePrincipalCode).substring(0, 2), 10);
  const isIndustry =
    (divPrincipal >= 5 && divPrincipal <= 33) ||
    (divPrincipal >= 41 && divPrincipal <= 43) ||
    divPrincipal === 38 ||
    analiseSecundarios.some(s => s.situacao === 'Enquadrado');

  return {
    id: index + 1,
    cnpj: cnpjFormatado,
    razaoSocial: data.razao_social || 'RAZÃO SOCIAL NÃO LOCALIZADA',
    nomeFantasia: data.nome_fantasia || 'NÃO INFORMADO',
    situacao: data.descricao_situacao_cadastral || 'ATIVA',
    dataAbertura: data.data_inicio_atividade || 'Não informada',
    porte: data.porte || 'DEMAIS',
    socios: sociosStr,
    logradouro,
    numero,
    complemento,
    bairro,
    municipio,
    uf,
    cep: cepFormatado,
    enderecoCompleto,
    cnaePrincipal: {
      code: cnaePrincipalCode.replace(/^(\d{4})(\d)(\d{2})$/, '$1-$2/$3'),
      rawCode: cnaePrincipalCode,
      desc: cnaePrincipalDesc,
      enquadramento: enquadramentoPrincipal
    },
    cnaesSecundarios: analiseSecundarios,
    isIndustry,
    avisoOffline: !!data.avisoOffline
  };
}
