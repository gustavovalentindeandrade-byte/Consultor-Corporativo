import React from 'react';
import { ShieldCheck, Scale, Compass, Layers, CheckCircle2, Mail, ExternalLink } from 'lucide-react';

export const RulesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              Critérios e Fundamentos Jurídico-Operacionais do Enquadramento Sindical
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              O enquadramento sindical patronal no Sistema FIRJAN obedece estritamente aos princípios da unicidade
              sindical e da territorialidade, consagrados pelo <strong>Artigo 8º, inciso II da Constituição Federal de 1988</strong>,
              e regulamentados pelos <strong>Artigos 511, 570 e 581 da Consolidação das Leis do Trabalho (CLT)</strong>,
              em perfeita harmonia com o Regulamento Associativo da FIRJAN e do CIRJ.
            </p>
          </div>
        </div>

        {/* 4 Pilares Fundamentais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Atividade Preponderante (CNAE Principal)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              A definição do sindicato patronal representativo é orientada pela atividade econômica principal da
              empresa (objeto social efetivo e receita preponderante), identificada na Receita Federal do Brasil por seu
              código de <strong>CNAE Fiscal de 7 dígitos</strong> (Art. 581, § 2º da CLT).
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Princípio da Territorialidade</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              A base territorial do estabelecimento define a entidade patronal competente. Entidades nacionais atuam em todo
              o território brasileiro; sindicatos estaduais atuam nos <strong>92 municípios fluminenses</strong>; e entidades
              regionais ou municipais possuem precedência territorial estrita sobre suas respectivas comarcas.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Análise de CNAEs Secundários</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Empresas com múltiplas atividades econômicas industriais ou mistas (comércio/indústria) possuem cada um dos
              seus CNAEs secundários mapeados, permitindo identificar oportunidades de agregação de valor e enquadramento
              complementar sem descaracterizar a atividade preponderante.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                4
              </span>
              <span>Resolução de Conflitos e Casos Específicos</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Atividades de alta especialização técnica (ex: Indústrias de Defesa - <strong>SIMDE</strong>,
              Refratários - <strong>SIR</strong>, Cimento - <strong>SNIC</strong>, Estanho - <strong>SNIEE</strong>) possuem
              precedência direta como sindicatos de âmbito nacional sobre enquadramentos regionais genéricos.
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Dispositivos Legais */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Dispositivos Legais Aplicáveis</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-2.5 px-3 w-44">Dispositivo</th>
                <th className="py-2.5 px-3 w-52">Tema Central</th>
                <th className="py-2.5 px-3">Aplicação no Simulador FIRJAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Art. 8º, II da CF/88</td>
                <td className="py-3 px-3 text-slate-700">Unicidade Sindical e Territorialidade</td>
                <td className="py-3 px-3 text-slate-600">
                  Impede a criação de mais de uma organização sindical na mesma base territorial, justificando a precedência dos sindicatos municipais e regionais fluminenses sobre os genéricos.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Art. 511 da CLT</td>
                <td className="py-3 px-3 text-slate-700">Conceito de Categoria Econômica</td>
                <td className="py-3 px-3 text-slate-600">
                  Solidariedade de interesses econômicos dos que empreendem atividades idênticas, similares ou conexas, estruturando os 101 sindicatos patronais filiados.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Art. 581, § 1º e 2º da CLT</td>
                <td className="py-3 px-3 text-slate-700">Atividade Preponderante vs Mista</td>
                <td className="py-3 px-3 text-slate-600">
                  Determina que o enquadramento patronal recaia sobre a atividade mais expressiva da empresa (CNAE Fiscal principal), facultando tratamento segmentado aos CNAEs secundários.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Estatuto FIRJAN / CIRJ</td>
                <td className="py-3 px-3 text-slate-700">Regulamento de Filiação Associativa</td>
                <td className="py-3 px-3 text-slate-600">
                  Reconhecimento das 92 comarcas municipais do Estado do Rio de Janeiro agrupadas nos Conselhos Regionais (Capital, Leste Fluminense, Baixada, Serrana, Norte, Noroeste, Sul Fluminense e Centro-Sul).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Caixa de Suporte ao Especialista */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-base font-bold">Canal de Apoio Técnico e Dúvidas Associativas</h4>
          <p className="text-xs text-slate-300 max-w-xl">
            Para casos com CNAE misto, atividades fabris especiais não listadas ou empresas com filiais fora do Estado do Rio de Janeiro, contate diretamente a equipe técnica da FIRJAN.
          </p>
        </div>
        <a
          href="mailto:associe-se@firjan.com.br"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-xs"
        >
          <Mail className="w-4 h-4" />
          <span>associe-se@firjan.com.br</span>
        </a>
      </div>
    </div>
  );
};
