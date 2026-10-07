import React, { useState } from 'react';
import { EmpresaConsultada } from '../types';
import { Copy, Check, ArrowUpDown } from 'lucide-react';

interface ConsolidatedTableViewProps {
  empresas: EmpresaConsultada[];
  onCopyAllTsv: () => void;
}

export const ConsolidatedTableView: React.FC<ConsolidatedTableViewProps> = ({
  empresas,
  onCopyAllTsv
}) => {
  const [copiedRowId, setCopiedRowId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'cnpj' | 'razao' | 'municipio' | 'situacao'>('cnpj');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleCopyRow = (emp: EmpresaConsultada) => {
    const secStr =
      emp.cnaesSecundarios
        .filter(s => s.situacao === 'Enquadrado')
        .map(s => `${s.cnae} -> ${s.sindicato}`)
        .join(' | ') || 'Nenhum';

    const linhaTsv = [
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

    navigator.clipboard.writeText(linhaTsv);
    setCopiedRowId(emp.id);
    setTimeout(() => setCopiedRowId(null), 1800);
  };

  const sortedEmpresas = [...empresas].sort((a, b) => {
    let valA = '';
    let valB = '';

    if (sortBy === 'cnpj') {
      valA = a.cnpj;
      valB = b.cnpj;
    } else if (sortBy === 'razao') {
      valA = a.razaoSocial;
      valB = b.razaoSocial;
    } else if (sortBy === 'municipio') {
      valA = `${a.municipio}-${a.uf}`;
      valB = `${b.municipio}-${b.uf}`;
    } else if (sortBy === 'situacao') {
      valA = a.cnaePrincipal.enquadramento.situacao;
      valB = b.cnaePrincipal.enquadramento.situacao;
    }

    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const toggleSort = (field: 'cnpj' | 'razao' | 'municipio' | 'situacao') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
      {/* Table toolbar */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">
            Tabela Consolidada de Enquadramento Sindical (TSV)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Estrutura tabular oficial com dados cadastrais, regras e CNAEs secundários mapeados
          </p>
        </div>

        <button
          onClick={onCopyAllTsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copiar Tabela TSV Completa</span>
        </button>
      </div>

      {/* Responsive table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold">
              <th
                onClick={() => toggleSort('cnpj')}
                className="py-3 px-3.5 whitespace-nowrap cursor-pointer hover:bg-slate-800 transition-colors w-36"
              >
                <div className="flex items-center gap-1">
                  <span>CNPJ</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('razao')}
                className="py-3 px-3.5 min-w-[240px] cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Razão Social</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('municipio')}
                className="py-3 px-3.5 whitespace-nowrap cursor-pointer hover:bg-slate-800 transition-colors w-28"
              >
                <div className="flex items-center gap-1">
                  <span>Município</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-2 text-center w-12 whitespace-nowrap">UF</th>
              <th className="py-3 px-3.5 min-w-[130px] whitespace-nowrap">Bairro</th>
              <th className="py-3 px-3.5 whitespace-nowrap w-28">CNAE Principal</th>
              <th className="py-3 px-3.5 min-w-[260px]">Sindicato Principal</th>
              <th className="py-3 px-3.5 min-w-[220px]">Regra Principal</th>
              <th
                onClick={() => toggleSort('situacao')}
                className="py-3 px-3.5 whitespace-nowrap text-center w-32 cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Situação</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3.5 min-w-[320px]">Secundários Enquadrados</th>
              <th className="py-3 px-2.5 text-center w-16 no-print">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedEmpresas.map(emp => {
              const secEnquadrados = emp.cnaesSecundarios.filter(s => s.situacao === 'Enquadrado');
              const secStr =
                secEnquadrados.length > 0
                  ? secEnquadrados.map(s => `${s.cnae} -> ${s.sindicato}`).join(' | ')
                  : 'Nenhum';

              return (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* CNPJ */}
                  <td className="py-3 px-3.5 font-mono font-bold text-blue-900 whitespace-nowrap tabular-nums">
                    {emp.cnpj}
                  </td>

                  {/* Razão Social */}
                  <td className="py-3 px-3.5 font-semibold text-slate-900 leading-snug">
                    <div>{emp.razaoSocial}</div>
                    {emp.nomeFantasia && emp.nomeFantasia !== 'NÃO INFORMADO' && (
                      <div className="text-[11px] font-normal text-slate-500">
                        Fantasia: {emp.nomeFantasia}
                      </div>
                    )}
                  </td>

                  {/* Município */}
                  <td className="py-3 px-3.5 text-slate-800 whitespace-nowrap font-medium">
                    {emp.municipio}
                  </td>

                  {/* UF */}
                  <td className="py-3 px-2 text-center font-bold text-slate-700 whitespace-nowrap">
                    {emp.uf}
                  </td>

                  {/* Bairro */}
                  <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                    <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[11px]">
                      {emp.bairro}
                    </span>
                  </td>

                  {/* CNAE Principal */}
                  <td className="py-3 px-3.5 font-mono font-semibold text-slate-800 whitespace-nowrap">
                    <span className="bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded text-[11px]">
                      {emp.cnaePrincipal.code}
                    </span>
                  </td>

                  {/* Sindicato Principal */}
                  <td className="py-3 px-3.5 font-semibold text-blue-950 leading-snug">
                    {emp.cnaePrincipal.enquadramento.sindicato}
                  </td>

                  {/* Regra Principal */}
                  <td className="py-3 px-3.5 text-slate-600 leading-snug text-[11px]">
                    {emp.cnaePrincipal.enquadramento.regra}
                  </td>

                  {/* Situação */}
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        emp.cnaePrincipal.enquadramento.situacao === 'Enquadrado'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : emp.cnaePrincipal.enquadramento.situacao === 'Consultar Especialista'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {emp.cnaePrincipal.enquadramento.situacao}
                    </span>
                  </td>

                  {/* Secundários Enquadrados */}
                  <td className="py-3 px-3.5 text-[11px] leading-snug">
                    {secEnquadrados.length > 0 ? (
                      <div className="space-y-1">
                        {secEnquadrados.map((sec, sIdx) => (
                          <div key={sIdx} className="text-slate-700">
                            <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-1 rounded mr-1">
                              {sec.cnae}
                            </span>
                            <span className="text-slate-400 mr-1">&rarr;</span>
                            <span className="font-medium text-blue-900">{sec.sindicato}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Nenhum</span>
                    )}
                  </td>

                  {/* Ação rápida de cópia da linha */}
                  <td className="py-3 px-2.5 text-center no-print">
                    <button
                      onClick={() => handleCopyRow(emp)}
                      title="Copiar linha no formato TSV"
                      className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedRowId === emp.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
