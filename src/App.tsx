import React, { useState, useEffect } from 'react';
import { TabType, EmpresaConsultada } from './types';
import { Header } from './components/Header';
import { TriageTab } from './components/TriageTab';
import { CatalogTab } from './components/CatalogTab';
import { RulesTab } from './components/RulesTab';
import { EXEMPLOS_CNPJ, buscarDadosCnpjComFallback, formatarEmpresaConsultada } from './services/cnpjService';
import { cleanNumber, extrairCnpjsDoTexto } from './data/firjanRules';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('triagem');
  const [cnpjInput, setCnpjInput] = useState<string>('');
  const [empresas, setEmpresas] = useState<EmpresaConsultada[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number; currentCnpj: string }>({
    current: 0,
    total: 0,
    currentCnpj: ''
  });

  // Carrega automaticamente os 6 exemplos no primeiro acesso para facilitar a demonstração
  useEffect(() => {
    const defaultText = EXEMPLOS_CNPJ.join('\n');
    setCnpjInput(defaultText);
    processarLista(EXEMPLOS_CNPJ);
  }, []);

  const processarLista = async (listaCnpjs: string[]) => {
    const limpos = listaCnpjs.map(cleanNumber).filter(c => c.length === 14);

    if (limpos.length === 0) {
      alert('Por favor, insira pelo menos um CNPJ válido com 14 dígitos numéricos.');
      return;
    }

    setLoading(true);
    setProgress({ current: 0, total: limpos.length, currentCnpj: '' });

    const novasEmpresas: EmpresaConsultada[] = [];

    for (let i = 0; i < limpos.length; i++) {
      const cnpj = limpos[i];
      const formatado = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

      setProgress({
        current: i + 1,
        total: limpos.length,
        currentCnpj: formatado
      });

      try {
        const rawData = await buscarDadosCnpjComFallback(cnpj);
        const emp = formatarEmpresaConsultada(rawData, i);
        novasEmpresas.push(emp);
        setEmpresas([...novasEmpresas]);
      } catch (err: any) {
        console.error('Erro ao processar CNPJ', cnpj, err);
      }

      // Pequeno intervalo suave para não travar o event loop do navegador
      await new Promise(r => setTimeout(r, 60));
    }

    setLoading(false);
  };

  const handleProcessar = () => {
    const lista = extrairCnpjsDoTexto(cnpjInput);
    processarLista(lista);
  };

  const handleCarregarExemplos = () => {
    const defaultText = EXEMPLOS_CNPJ.join('\n');
    setCnpjInput(defaultText);
    processarLista(EXEMPLOS_CNPJ);
  };

  const handleLimpar = () => {
    setCnpjInput('');
    setEmpresas([]);
    setProgress({ current: 0, total: 0, currentCnpj: '' });
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        totalEmpresas={empresas.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'triagem' && (
          <TriageTab
            cnpjInput={cnpjInput}
            setCnpjInput={setCnpjInput}
            empresas={empresas}
            loading={loading}
            progress={progress}
            onProcessar={handleProcessar}
            onCarregarExemplos={handleCarregarExemplos}
            onLimpar={handleLimpar}
            onImprimir={handleImprimir}
          />
        )}

        {currentTab === 'catalogo' && <CatalogTab />}

        {currentTab === 'regras' && <RulesTab />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <span>Sistema Consultor Corporativo &copy; 2026</span>
          <span className="mx-2">·</span>
          <span>Desenvolvido para a Divisão de Relacionamento Corporativo – Sistema FIRJAN / CIRJ</span>
          <span className="mx-2">·</span>
          <span>101 Sindicatos Patronais & 92 Municípios do Estado do Rio de Janeiro</span>
        </div>
      </footer>
    </div>
  );
}
