import React, { useState } from 'react';
import { EmpresaConsultada } from '../types';
import { CompanyCard } from './CompanyCard';
import { ConsolidatedTableView } from './ConsolidatedTableView';
import { exportarExcel, copiarTsv } from '../utils/exportUtils';
import { extrairCnpjsDoTexto } from '../data/firjanRules';
import {
  Search,
  FileSpreadsheet,
  Copy,
  Printer,
  RotateCcw,
  Sparkles,
  Shield,
  Building,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';

interface TriageTabProps {
  cnpjInput: string;
  setCnpjInput: (v: string) => void;
  empresas: EmpresaConsultada[];
  loading: boolean;
  progress: { current: number; total: number; currentCnpj: string };
  onProcessar: () => void;
  onCarregarExemplos: () => void;
  onLimpar: () => void;
  onImprimir: () => void;
}

export const TriageTab: React.FC<TriageTabProps> = ({
  cnpjInput,
  setCnpjInput,
  empresas,
  loading,
  progress,
  onProcessar,
  onCarregarExemplos,
  onLimpar,
  onImprimir
}) => {
  const [copiedTsvSuccess, setCopiedTsvSuccess] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'INDUSTRIA' | 'COMERCIO' | 'ESPECIALISTA'>('TODOS');
  const [buscaTexto, setBuscaTexto] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Extração inteligente de CNPJs (suporta texto puro, CSV, TSV e colunas de planilhas)
  const cnpjsValidos = extrairCnpjsDoTexto(cnpjInput);

  const handleCopyTsv = () => {
    const ok = copiarTsv(empresas);
    if (ok) {
      setCopiedTsvSuccess(true);
      setTimeout(() => setCopiedTsvSuccess(false), 2200);
    }
  };

  // Filtragem de empresas na visualização
  const empresasFiltradas = empresas.filter(emp => {
    // Filtro por tipo
    if (filtroTipo === 'INDUSTRIA' && !emp.isIndustry) return false;
    if (filtroTipo === 'COMERCIO' && emp.isIndustry) return false;
    if (filtroTipo === 'ESPECIALISTA' && emp.cnaePrincipal.enquadramento.situacao !== 'Consultar Especialista')
      return false;

    // Busca textual
    if (buscaTexto.trim()) {
      const q = buscaTexto.toLowerCase();
      const matchCnpj = emp.cnpj.toLowerCase().includes(q);
      const matchRazao = emp.razaoSocial.toLowerCase().includes(q);
      const matchSind = emp.cnaePrincipal.enquadramento.sindicato.toLowerCase().includes(q);
      const matchMun = emp.municipio.toLowerCase().includes(q);
      const matchCnae = emp.cnaePrincipal.code.toLowerCase().includes(q);
      return matchCnpj || matchRazao || matchSind || matchMun || matchCnae;
    }

    return true;
  });

  // Estatísticas rápidas
  const totalIndustrias = empresas.filter(e => e.isIndustry).length;
  const totalEnquadrados = empresas.filter(
    e => e.cnaePrincipal.enquadramento.situacao === 'Enquadrado'
  ).length;
  const totalEspecialistas = empresas.filter(
    e => e.cnaePrincipal.enquadramento.situacao === 'Consultar Especialista'
  ).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Coluna da Esquerda: Entrada de Dados e Controles (4 cols) */}
      <div className="lg:col-span-4 space-y-5 no-print">
        {/* Card de Entrada */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Entrada de CNPJs / Tabela</span>
            </h2>
            <span className="text-xs font-mono font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
              {cnpjsValidos.length} identificado{cnpjsValidos.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cnpj-input" className="text-xs text-slate-500 block">
              Insira os CNPJs ou cole uma tabela TSV/Excel (identifica CNPJs automaticamente):
            </label>
            <textarea
              id="cnpj-input"
              rows={6}
              value={cnpjInput}
              onChange={e => setCnpjInput(e.target.value)}
              placeholder="33.000.167/0001-01&#10;12.345.678/0001-99&#10;28.123.456/0001-77"
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-y"
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={onProcessar}
              disabled={loading || cnpjsValidos.length === 0}
              className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loading || cnpjsValidos.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-xs'
              }`}
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Processando Triagem ({progress.current}/{progress.total})...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Processar Consulta e Enquadramento</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onCarregarExemplos}
                disabled={loading}
                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition-colors cursor-pointer text-center"
              >
                Carregar 6 Exemplos
              </button>
              <button
                type="button"
                onClick={onLimpar}
                disabled={loading}
                className="py-1.5 px-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-medium rounded-md transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar</span>
              </button>
            </div>
          </div>

          {/* Exportação */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Exportação & Relatórios
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => exportarExcel(empresas)}
                disabled={empresas.length === 0}
                className={`w-full py-2 px-3 text-xs font-medium rounded-md flex items-center gap-2 transition-colors cursor-pointer ${
                  empresas.length === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Exportar Excel (.xlsx 4 Abas Completo)</span>
              </button>

              <button
                onClick={handleCopyTsv}
                disabled={empresas.length === 0}
                className={`w-full py-2 px-3 text-xs font-medium rounded-md flex items-center gap-2 transition-colors cursor-pointer ${
                  empresas.length === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <Copy className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{copiedTsvSuccess ? 'Copiado para Área de Transferência!' : 'Copiar Tabela (TSV / Sheets)'}</span>
              </button>

              <button
                onClick={onImprimir}
                disabled={empresas.length === 0}
                className={`w-full py-2 px-3 text-xs font-medium rounded-md flex items-center gap-2 transition-colors cursor-pointer ${
                  empresas.length === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Printer className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Imprimir / Gerar PDF Executivo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resumo das Diretrizes Oficiais */}
        <div className="bg-slate-50/90 rounded-xl border border-slate-200 p-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Diretrizes do Simulador Oficial FIRJAN</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-2 pl-4 list-disc">
            <li>
              <strong className="text-slate-800">CNAE Principal:</strong> Define a atividade preponderante e o enquadramento patronal oficial da empresa (Art. 581 da CLT).
            </li>
            <li>
              <strong className="text-slate-800">CNAEs Secundários:</strong> Analisados individualmente em seção detalhada, sem descaracterizar a atividade principal.
            </li>
            <li>
              <strong className="text-slate-800">Endereço Desmembrado:</strong> Identificação territorial estrita por Município, Bairro e Comarca Fluminense.
            </li>
            <li>
              <strong className="text-slate-800">Hierarquia Territorial:</strong> Entidades Nacionais para qualquer UF; Estaduais e Regionais/Municipais exclusivas do Estado do RJ.
            </li>
            <li>
              <strong className="text-slate-800">Base Pré-Compilada:</strong> 1.355 CNAEs e 101 sindicatos patronais filiados integrados deterministicamente.
            </li>
          </ul>
        </div>
      </div>

      {/* Coluna da Direita: Resultados e Visualização (8 cols) */}
      <div className="lg:col-span-8 space-y-5">
        {/* Barra de Progresso durante execução */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2 no-print">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Consultando CNPJ: <strong className="font-mono">{progress.currentCnpj || 'Iniciando...'}</strong></span>
              </span>
              <span className="font-mono tabular-nums">{progress.current} de {progress.total}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Resumo de Métricas & Modo de Visualização (quando houver empresas) */}
        {empresas.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Empresas Triadas</span>
                </h2>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono font-semibold">
                  {empresas.length} total
                </span>
              </div>

              {/* Toggle de Modo de Visualização: Tabela vs Cards */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg no-print self-start sm:self-auto">
                <button
                  onClick={() => setViewMode('table')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Tabela Consolidada (TSV)</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards Detalhados</span>
                </button>
              </div>
            </div>

            {/* Filtros rápidos de visualização por categoria */}
            <div className="flex flex-wrap items-center justify-between gap-2 no-print">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setFiltroTipo('TODOS')}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    filtroTipo === 'TODOS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todas ({empresas.length})
                </button>
                <button
                  onClick={() => setFiltroTipo('INDUSTRIA')}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    filtroTipo === 'INDUSTRIA' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Indústria ({totalIndustrias})
                </button>
                <button
                  onClick={() => setFiltroTipo('COMERCIO')}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    filtroTipo === 'COMERCIO' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Comércio/Serv. ({empresas.length - totalIndustrias})
                </button>
                <button
                  onClick={() => setFiltroTipo('ESPECIALISTA')}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    filtroTipo === 'ESPECIALISTA' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Especialista ({totalEspecialistas})
                </button>
              </div>

              {/* Quick search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={buscaTexto}
                  onChange={e => setBuscaTexto(e.target.value)}
                  placeholder="Buscar Razão, CNPJ, Município..."
                  className="w-full text-xs pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Renderização de Resultados: Tabela Consolidada OU Cards Detalhados */}
        {empresasFiltradas.length > 0 ? (
          viewMode === 'table' ? (
            <ConsolidatedTableView
              empresas={empresasFiltradas}
              onCopyAllTsv={handleCopyTsv}
            />
          ) : (
            <div>
              {empresasFiltradas.map(emp => (
                <CompanyCard key={emp.id} empresa={emp} />
              ))}
            </div>
          )
        ) : empresas.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
            <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">Nenhuma empresa encontrada com os filtros atuais.</h3>
            <p className="text-xs text-slate-500 mt-1">Ajuste o termo de busca ou selecione o filtro &quot;Todas&quot;.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Nenhuma empresa consultada no momento</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Insira os CNPJs ou cole uma tabela no painel à esquerda e clique em <strong>Processar Consulta e Enquadramento</strong> para iniciar a análise automatizada das regras patronais.
              </p>
            </div>
            <div>
              <button
                onClick={onCarregarExemplos}
                className="inline-flex items-center gap-1.5 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <span>Carregar 6 CNPJs de Demonstração</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
