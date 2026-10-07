import * as XLSX from 'xlsx';
import { EmpresaConsultada } from '../types';
import { SINDICATOS_CATALOGO, REGIOES_RJ } from '../data/firjanRules';

export function exportarExcel(empresas: EmpresaConsultada[]) {
  if (!empresas || empresas.length === 0) {
    alert('Não há dados de empresas para exportar. Realize uma consulta primeiro ou carregue os exemplos.');
    return;
  }

  const dadosTriagem = empresas.map(emp => ({
    CNPJ: emp.cnpj,
    'Razão Social': emp.razaoSocial,
    'Nome Fantasia': emp.nomeFantasia,
    'Situação': emp.situacao,
    'Data de Abertura': emp.dataAbertura,
    Porte: emp.porte,
    'Quadro Societário (QSA)': emp.socios,
    Logradouro: emp.logradouro,
    'Número': emp.numero,
    Complemento: emp.complemento,
    'Bairro / Distrito': emp.bairro,
    'Município': emp.municipio,
    UF: emp.uf,
    CEP: emp.cep,
    'Endereço Completo': emp.enderecoCompleto,
    'CNAE Principal': emp.cnaePrincipal.code,
    'Descrição CNAE Principal': emp.cnaePrincipal.desc,
    'Sindicato Patronal (Principal)': emp.cnaePrincipal.enquadramento.sindicato,
    'Regra Aplicada': emp.cnaePrincipal.enquadramento.regra,
    'Situação Enquadramento': emp.cnaePrincipal.enquadramento.situacao,
    'Perfil': emp.isIndustry ? 'Indústria' : 'Comércio / Serviços',
    'Total CNAEs Secundários': emp.cnaesSecundarios.length,
    'Resumo Secundários Enquadrados':
      emp.cnaesSecundarios
        .filter(s => s.situacao === 'Enquadrado')
        .map(s => `${s.cnae}: ${s.sindicato}`)
        .join(' | ') || 'Nenhum'
  }));

  const wb = XLSX.utils.book_new();

  // Aba 1: Triagem_CNPJ
  const ws1 = XLSX.utils.json_to_sheet(dadosTriagem);
  XLSX.utils.book_append_sheet(wb, ws1, 'Triagem_CNPJ');

  // Aba 2: Secundarios_Detalhado
  const dadosSecundarios: any[] = [];
  empresas.forEach(emp => {
    if (emp.cnaesSecundarios.length > 0) {
      emp.cnaesSecundarios.forEach(sec => {
        dadosSecundarios.push({
          CNPJ: emp.cnpj,
          'Razão Social': emp.razaoSocial,
          'Município': emp.municipio,
          UF: emp.uf,
          'CNAE Secundário': sec.cnae,
          'Descrição da Atividade': sec.desc,
          'Sindicato Enquadrado': sec.sindicato,
          'Regra Aplicada': sec.regra,
          'Situação': sec.situacao
        });
      });
    }
  });
  if (dadosSecundarios.length > 0) {
    const ws2 = XLSX.utils.json_to_sheet(dadosSecundarios);
    XLSX.utils.book_append_sheet(wb, ws2, 'Secundarios_Detalhado');
  }

  // Aba 3: Regras_Sindicatos (Catálogo oficial dos 101 sindicatos)
  const catalogoDados = SINDICATOS_CATALOGO.map(s => ({
    Sigla: s.sigla,
    'Nome Completo do Sindicato Oficial': s.nome,
    'Âmbito Territorial': s.ambito,
    'Abrangência': s.abrang,
    'CNAEs / Divisões Abrangidas': s.cnaes
  }));
  const ws3 = XLSX.utils.json_to_sheet(catalogoDados);
  XLSX.utils.book_append_sheet(wb, ws3, 'Regras_Sindicatos');

  // Aba 4: De_Para_Municipios_RJ (Todos os 92 municípios)
  const municipiosDados: any[] = [];
  Object.keys(REGIOES_RJ)
    .sort()
    .forEach(reg => {
      REGIOES_RJ[reg].sort().forEach(mun => {
        municipiosDados.push({
          'Município': mun,
          'Região Oficial FIRJAN': reg,
          UF: 'RJ'
        });
      });
    });
  const ws4 = XLSX.utils.json_to_sheet(municipiosDados);
  XLSX.utils.book_append_sheet(wb, ws4, 'De_Para_Municipios_RJ');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Consultor_Corporativo_FIRJAN_Enquadramento_${dateStr}.xlsx`);
}

export function copiarTsv(empresas: EmpresaConsultada[]): boolean {
  if (!empresas || empresas.length === 0) {
    alert('Não há dados para copiar. Realize uma consulta primeiro.');
    return false;
  }

  const cabecalho = [
    'CNPJ',
    'Razão Social',
    'Município',
    'UF',
    'Bairro',
    'CNAE Principal',
    'Sindicato Principal',
    'Regra Principal',
    'Situação',
    'Secundários Enquadrados'
  ].join('\t');

  const linhas = empresas.map(emp => {
    const secStr =
      emp.cnaesSecundarios
        .filter(s => s.situacao === 'Enquadrado')
        .map(s => `${s.cnae} -> ${s.sindicato}`)
        .join(' | ') || 'Nenhum';

    return [
      emp.cnpj,
      emp.razaoSocial,
      emp.municipio,
      emp.uf,
      emp.bairro,
      emp.cnaePrincipal.code,
      emp.cnaePrincipal.enquadramento.sindicato,
      emp.cnaePrincipal.enquadramento.regra,
      emp.cnaePrincipal.enquadramento.situacao,
      secStr
    ].join('\t');
  });

  const tsv = [cabecalho, ...linhas].join('\n');

  try {
    navigator.clipboard.writeText(tsv);
    return true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = tsv;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

export function gerarTextoEnquadramentoParecer(emp: EmpresaConsultada): string {
  const ep = emp.cnaePrincipal.enquadramento;
  const secEnquadrados = emp.cnaesSecundarios.filter(s => s.situacao === 'Enquadrado');

  let texto = `PARECER DE ENQUADRAMENTO SINDICAL PATRONAL - FIRJAN / CIRJ\n`;
  texto += `===========================================================\n`;
  texto += `Razão Social: ${emp.razaoSocial}\n`;
  texto += `CNPJ: ${emp.cnpj}\n`;
  texto += `Endereço: ${emp.enderecoCompleto}\n`;
  texto += `Município/UF: ${emp.municipio} - ${emp.uf}\n\n`;
  texto += `1. ATIVIDADE PREPONDERANTE (CNAE PRINCIPAL):\n`;
  texto += `Código: ${emp.cnaePrincipal.code} - ${emp.cnaePrincipal.desc}\n`;
  texto += `Sindicato Patronal Competente: ${ep.sindicato}\n`;
  texto += `Situação: ${ep.situacao} (${ep.confianca})\n`;
  texto += `Fundamento / Regra: ${ep.regra}\n\n`;

  if (secEnquadrados.length > 0) {
    texto += `2. CNAES SECUNDÁRIOS COM ENQUADRAMENTO COMPLEMENTAR (${secEnquadrados.length}):\n`;
    secEnquadrados.forEach((s, idx) => {
      texto += `   ${idx + 1}. CNAE ${s.cnae}: ${s.desc}\n      -> Entidade: ${s.sindicato}\n      -> Regra: ${s.regra}\n`;
    });
    texto += `\n`;
  }

  texto += `Critérios observados: Princípios da Unicidade e Territorialidade Sindical (Art. 8º, II, CF/88 e Arts. 511, 570 e 581 da CLT).\n`;
  texto += `Em caso de dúvidas operacionais ou atividades especializadas: associe-se@firjan.com.br`;

  return texto;
}
