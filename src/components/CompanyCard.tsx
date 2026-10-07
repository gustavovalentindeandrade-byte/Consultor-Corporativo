import React, { useState } from 'react';
import { EmpresaConsultada } from '../types';
import { gerarTextoEnquadramentoParecer } from '../utils/exportUtils';
import {
  Building,
  MapPin,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  AlertTriangle,
  Award
} from 'lucide-react';

interface CompanyCardProps {
  empresa: EmpresaConsultada;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ empresa }) => {
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [filterSec, setFilterSec] = useState<'TODOS' | 'Enquadrado' | 'Outros'>('TODOS');
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [copiedCnpj, setCopiedCnpj] = useState(false);

  const ep = empresa.cnaePrincipal.enquadramento;
  const totalSec = empresa.cnaesSecundarios.length;
  const totalEnq = empresa.cnaesSecundarios.filter(s => s.situacao === 'Enquadrado').length;
  const totalOutros = totalSec - totalEnq;

  const secundariosFiltrados = empresa.cnaesSecundarios.filter(s => {
    if (filterSec === 'TODOS') return true;
    if (filterSec === 'Enquadrado') return s.situacao === 'Enquadrado';
    return s.situacao !== 'Enquadrado';
  });

  const handleCopyMemo = () => {
    const txt = gerarTextoEnquadramentoParecer(empresa);
    navigator.clipboard.writeText(txt);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2200);
  };

  const handleCopyCnpj = () => {
    navigator.clipboard.writeText(empresa.cnpj.replace(/\D/g, ''));
    setCopiedCnpj(true);
    setTimeout(() => setCopiedCnpj(false), 1800);
  };

  return (
    <article
      className={`bg-white rounded-xl border transition-shadow duration-200 shadow-xs mb-6 overflow-hidden ${
        empresa.isIndustry ? 'border-l-4 border-l-emerald-600 border-slate-200' : 'border-l-4 border-l-slate-400 border-slate-200'
      }`}
    >
      {/* Header do Card */}
      <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="space-y-1">
          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <button
              onClick={handleCopyCnpj}
              title="Clique para copiar o CNPJ limpo"
              className="inline-flex items-center gap-1.5 font-mono font-bold text-sm text-blue-700 hover:text-blue-900 transition-colors"
            >
              <span>{empresa.cnpj}</span>
              {copiedCnpj ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-medium text-slate-700 uppercase bg-slate-200/70 px-2 py-0.5 rounded text-[11px]">
              {empresa.porte}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                empresa.situacao === 'ATIVA'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {empresa.situacao}
            </span>
            {empresa.avisoOffline && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  Modo Demonstração (Fallback)
                </span>
              </>
            )}
          </div>

          {/* Razão Social & Nome Fantasia */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {empresa.razaoSocial}
          </h3>
          <p className="text-xs text-slate-500">
            <span className="font-medium text-slate-600">Nome Fantasia:</span>{' '}
            {empresa.nomeFantasia || 'Não informado'}
          </p>
        </div>

        {/* Badges de perfil e Ação rápida */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${
              empresa.isIndustry
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-700 text-white shadow-xs'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            {empresa.isIndustry ? 'Perfil Indústria' : 'Comércio / Serviços'}
          </span>

          <button
            onClick={handleCopyMemo}
            title="Copiar parecer formal em texto para e-mail"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-xs font-medium transition-colors cursor-pointer"
          >
            {copiedMemo ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar Parecer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Corpo do Card */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Coluna 1: Dados Cadastrais & Localização (5 colunas) */}
          <div className="lg:col-span-5 bg-slate-50 rounded-lg p-4 border border-slate-200/80 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 text-xs font-bold text-slate-900 uppercase tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>Dados Cadastrais & Localização</span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-700">
                <div>
                  <span className="font-semibold text-slate-900">Logradouro:</span> {empresa.logradouro}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Número / Compl.:</span> {empresa.numero}{' '}
                  {empresa.complemento ? `(${empresa.complemento})` : ''}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Bairro / Distrito:</span>{' '}
                  <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-medium">
                    {empresa.bairro}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Município / UF:</span>{' '}
                  <strong className="text-slate-900">
                    {empresa.municipio} - {empresa.uf}
                  </strong>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">CEP:</span>{' '}
                  <span className="font-mono">{empresa.cep}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                <span>
                  <strong className="text-slate-700">Abertura:</strong> {empresa.dataAbertura}
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <Users className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                <span className="truncate" title={empresa.socios}>
                  <strong className="text-slate-700">Sócios (QSA):</strong> {empresa.socios}
                </span>
              </div>
            </div>
          </div>

          {/* Coluna 2: Enquadramento Sindical Oficial (7 colunas) */}
          <div className="lg:col-span-7 bg-white rounded-lg p-4 border border-blue-100 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wide">
                  <Award className="w-3.5 h-3.5 text-blue-700" />
                  <span>Enquadramento Sindical Oficial (CNAE Principal)</span>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    ep.situacao === 'Enquadrado'
                      ? 'bg-emerald-100 text-emerald-800'
                      : ep.situacao === 'Consultar Especialista'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {ep.situacao}
                </span>
              </div>

              <div className="mb-3">
                <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Sindicato Patronal Competente
                </div>
                <div className="text-base sm:text-lg font-bold text-blue-900 leading-snug">
                  {ep.sindicato}
                </div>
              </div>

              <div className="text-xs mb-3 space-y-1">
                <span className="font-semibold text-slate-900">Atividade Preponderante:</span>
                <div className="flex items-start gap-2 mt-0.5">
                  <span className="bg-blue-100 text-blue-800 font-mono font-semibold px-1.5 py-0.5 rounded text-[11px] shrink-0">
                    {empresa.cnaePrincipal.code}
                  </span>
                  <span className="text-slate-700 leading-snug">{empresa.cnaePrincipal.desc}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-l-4 border-l-blue-600 rounded-r-md p-3 text-xs text-slate-700 space-y-1 mt-2">
              <div className="font-semibold text-slate-900">Regra / Fundamento Aplicado:</div>
              <div className="text-slate-800">{ep.regra}</div>
              <div className="text-[11px] text-slate-500 pt-1 flex flex-wrap items-center gap-2">
                <span>
                  <strong>Nível de Confiança:</strong> {ep.confianca}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  <strong>Localidade:</strong> {empresa.municipio} ({empresa.uf})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CNAEs Secundários Accordion */}
        {totalSec > 0 ? (
          <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setAccordionOpen(!accordionOpen)}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800">
                <span>Detalhamento dos CNAEs Secundários</span>
                <span className="text-xs text-slate-500 font-normal">
                  ({totalSec} analisado{totalSec > 1 ? 's' : ''}
                  {totalEnq > 0 && (
                    <span className="text-emerald-700 font-semibold ml-1">
                      · {totalEnq} com enquadramento industrial
                    </span>
                  )}
                  )
                </span>
              </div>
              <div className="text-slate-500">
                {accordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {accordionOpen && (
              <div className="p-4 bg-white border-t border-slate-200">
                {/* Filter buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
                    <button
                      onClick={() => setFilterSec('TODOS')}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                        filterSec === 'TODOS'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Todos ({totalSec})
                    </button>
                    <button
                      onClick={() => setFilterSec('Enquadrado')}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                        filterSec === 'Enquadrado'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Enquadrados ({totalEnq})
                    </button>
                    <button
                      onClick={() => setFilterSec('Outros')}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                        filterSec === 'Outros'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Outros ({totalOutros})
                    </button>
                  </div>

                  <span className="text-xs text-slate-500 italic">
                    Análise independente para mapeamento associativo completo
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-semibold">
                        <th className="py-2 px-3 w-28 whitespace-nowrap">CNAE Secundário</th>
                        <th className="py-2 px-3 min-w-[220px]">Descrição da Atividade</th>
                        <th className="py-2 px-3 min-w-[200px]">Sindicato Patronal Mapeado</th>
                        <th className="py-2 px-3 min-w-[180px]">Regra / Fundamento</th>
                        <th className="py-2 px-3 w-28 text-center">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {secundariosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400">
                            Nenhuma atividade encontrada para o filtro selecionado.
                          </td>
                        </tr>
                      ) : (
                        secundariosFiltrados.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                              {s.cnae.replace(/^(\d{4})(\d)(\d{2})$/, '$1-$2/$3')}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 leading-snug">{s.desc}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`font-semibold ${
                                  s.situacao === 'Enquadrado' ? 'text-blue-900' : 'text-slate-500'
                                }`}
                              >
                                {s.sindicato}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 text-[11px]">{s.regra}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${
                                  s.situacao === 'Enquadrado'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : s.situacao === 'Consultar Especialista'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {s.situacao}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Empresa possui unicamente CNAE principal registrado (sem atividades secundárias cadastradas).</span>
          </div>
        )}
      </div>
    </article>
  );
};
