import React, { useState, useMemo } from 'react';
import { SINDICATOS_CATALOGO, cleanText } from '../data/firjanRules';
import { BookOpen, Search, Filter } from 'lucide-react';

export const CatalogTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'TODOS' | 'Nacional' | 'Estadual RJ' | 'Regional/Municipal'>('TODOS');

  const filteredSindicatos = useMemo(() => {
    const term = cleanText(searchTerm);
    return SINDICATOS_CATALOGO.filter(s => {
      // Scope filter
      if (scopeFilter === 'Nacional' && s.ambito !== 'Nacional') return false;
      if (scopeFilter === 'Estadual RJ' && !s.ambito.includes('Estadual')) return false;
      if (scopeFilter === 'Regional/Municipal' && (s.ambito === 'Nacional' || s.ambito.includes('Estadual')))
        return false;

      // Text filter
      if (!term) return true;
      const matchSigla = cleanText(s.sigla).includes(term);
      const matchNome = cleanText(s.nome).includes(term);
      const matchAbrang = cleanText(s.abrang).includes(term);
      const matchCnaes = cleanText(s.cnaes).includes(term);
      return matchSigla || matchNome || matchAbrang || matchCnaes;
    });
  }, [searchTerm, scopeFilter]);

  const totalNacionais = SINDICATOS_CATALOGO.filter(s => s.ambito === 'Nacional').length;
  const totalEstaduais = SINDICATOS_CATALOGO.filter(s => s.ambito.includes('Estadual')).length;
  const totalRegionais = SINDICATOS_CATALOGO.length - totalNacionais - totalEstaduais;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header da Aba */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Catálogo Oficial dos 101 Sindicatos Patronais Filiados à FIRJAN</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Base oficial das entidades patronais com representação industrial no Sistema FIRJAN / CIRJ
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filtrar por sigla, nome, abrangência ou CNAE..."
              className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
            <button
              onClick={() => setScopeFilter('TODOS')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                scopeFilter === 'TODOS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({SINDICATOS_CATALOGO.length})
            </button>
            <button
              onClick={() => setScopeFilter('Nacional')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                scopeFilter === 'Nacional'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nacionais ({totalNacionais})
            </button>
            <button
              onClick={() => setScopeFilter('Estadual RJ')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                scopeFilter === 'Estadual RJ'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Estaduais RJ ({totalEstaduais})
            </button>
            <button
              onClick={() => setScopeFilter('Regional/Municipal')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                scopeFilter === 'Regional/Municipal'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Regionais / Municipais ({totalRegionais})
            </button>
          </div>

          <span className="text-xs text-slate-500">
            Exibindo <strong>{filteredSindicatos.length}</strong> de <strong>{SINDICATOS_CATALOGO.length}</strong> entidades patronais
          </span>
        </div>

        {/* Tabela dos 101 Sindicatos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold">
                <th className="py-3 px-4 w-28 whitespace-nowrap">Sigla</th>
                <th className="py-3 px-4 min-w-[320px]">Nome Completo da Entidade Patronal</th>
                <th className="py-3 px-4 w-32 whitespace-nowrap">Âmbito</th>
                <th className="py-3 px-4 min-w-[220px]">Abrangência Territorial</th>
                <th className="py-3 px-4 min-w-[220px]">CNAEs / Setores Econômicos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSindicatos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <Filter className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <span>Nenhum sindicato encontrado com os filtros atuais.</span>
                  </td>
                </tr>
              ) : (
                filteredSindicatos.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                        {s.sigla}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 leading-snug">
                      {s.nome}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          s.ambito === 'Nacional'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.ambito.includes('Estadual')
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {s.ambito}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 leading-snug">
                      {s.abrang}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700 leading-snug">
                      {s.cnaes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
