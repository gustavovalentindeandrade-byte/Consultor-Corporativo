import React from 'react';
import { TabType } from '../types';
import { Briefcase, Building2, BookOpen, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  totalEmpresas: number;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange, totalEmpresas }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark (Single text element with icon) */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-tight">
                Consultor Corporativo FIRJAN
              </span>
              <span className="text-xs text-slate-400 font-normal">
                Triagem & Enquadramento Sindical Oficial
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Clean text links with hover and active states) */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onTabChange('triagem')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                currentTab === 'triagem'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Triagem de CNPJs</span>
              {totalEmpresas > 0 && (
                <span className="text-xs bg-blue-600/30 text-blue-300 px-1.5 py-0.5 rounded-full font-mono tabular-nums">
                  {totalEmpresas}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('catalogo')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                currentTab === 'catalogo'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Catálogo de Sindicatos</span>
              <span className="text-xs text-slate-400 font-mono tabular-nums">101</span>
            </button>

            <button
              onClick={() => onTabChange('regras')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                currentTab === 'regras'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Regras & Legislação</span>
            </button>
          </nav>

          {/* Zone 3: Actions / Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% Regras FIRJAN/CIRJ Integradas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex border-t border-slate-800 bg-slate-900/90 px-2 py-1.5 gap-1 overflow-x-auto">
        <button
          onClick={() => onTabChange('triagem')}
          className={`flex-1 min-w-[120px] py-1.5 px-2 text-xs font-medium rounded text-center whitespace-nowrap ${
            currentTab === 'triagem' ? 'bg-blue-600 text-white' : 'text-slate-300'
          }`}
        >
          Triagem ({totalEmpresas})
        </button>
        <button
          onClick={() => onTabChange('catalogo')}
          className={`flex-1 min-w-[130px] py-1.5 px-2 text-xs font-medium rounded text-center whitespace-nowrap ${
            currentTab === 'catalogo' ? 'bg-blue-600 text-white' : 'text-slate-300'
          }`}
        >
          101 Sindicatos
        </button>
        <button
          onClick={() => onTabChange('regras')}
          className={`flex-1 min-w-[120px] py-1.5 px-2 text-xs font-medium rounded text-center whitespace-nowrap ${
            currentTab === 'regras' ? 'bg-blue-600 text-white' : 'text-slate-300'
          }`}
        >
          Legislação
        </button>
      </div>
    </header>
  );
};
