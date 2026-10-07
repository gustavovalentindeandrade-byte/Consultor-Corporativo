import { CnaeAnaliseSecundario, EnquadramentoPrincipal, SindicatoItem } from '../types';

export const cleanNumber = (v: string | number | undefined | null): string =>
  v ? String(v).replace(/\D/g, '') : '';

export const cleanText = (t: string | undefined | null): string =>
  t
    ? t
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\s+/g, '')
    : '';

export function extrairCnpjsDoTexto(texto: string): string[] {
  if (!texto) return [];
  // 1. Procurar CNPJs formatados padrão RFB (XX.XXX.XXX/XXXX-XX)
  const formatados = texto.match(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g) || [];

  // 2. Procurar sequências isoladas de 14 dígitos numéricos
  const puros = texto.match(/\b\d{14}\b/g) || [];

  // 3. Fallback: procurar por linhas ou tokens
  const tokens = texto.split(/[\r\n\t,;]+/);
  const extraidosTokens: string[] = [];
  for (const token of tokens) {
    const limpo = cleanNumber(token);
    if (limpo.length === 14) {
      extraidosTokens.push(limpo);
    }
  }

  const todos = [
    ...formatados.map(cleanNumber),
    ...puros.map(cleanNumber),
    ...extraidosTokens
  ];

  // Preservar ordem e eliminar repetições
  return Array.from(new Set(todos));
}

// 16 CNAEs expressamente fora do perfil industrial
export const CNAES_FORA = new Set([
  '5612100', '6410700', '6423900', '8299704', '8299707', '8422100',
  '8423000', '8424800', '8425600', '8430200', '9200301', '9200302',
  '9200399', '9420100', '9609204', '9700500'
]);

export interface CnaeDinamicoInfo {
  subclasse: string;
  desc: string;
  assoc: 'Sindicato' | 'Consultar Especialista' | 'Fora do Perfil';
  neg: string;
  ind: boolean;
}

export function getCnaeInfoDinamico(cnaeClean: string): CnaeDinamicoInfo {
  const code = String(cnaeClean || '').padStart(7, '0');
  const div = parseInt(code.substring(0, 2), 10);

  if (CNAES_FORA.has(code)) {
    return {
      subclasse: code.replace(/^(\d{4})(\d)(\d{2})$/, '$1-$2/$3'),
      desc: 'Atividade Comercial / Serviços fora do perfil industrial',
      assoc: 'Fora do Perfil',
      neg: 'Comércio e Serviço',
      ind: false
    };
  }

  const isInd = (div >= 5 && div <= 33) || (div >= 41 && div <= 43) || div === 38;
  return {
    subclasse: code.replace(/^(\d{4})(\d)(\d{2})$/, '$1-$2/$3'),
    desc: isInd ? 'Atividade Industrial / Construção' : 'Comércio / Serviços',
    assoc: isInd ? 'Sindicato' : 'Consultar Especialista',
    neg: isInd ? 'Indústria' : 'Comércio e Serviço',
    ind: isInd
  };
}

export const baseCNAEs: Record<string, CnaeDinamicoInfo> = new Proxy({}, {
  get(target: Record<string, CnaeDinamicoInfo>, prop: string | symbol) {
    if (typeof prop !== 'string' || !/^\d{5,7}$/.test(prop)) {
      return (target as any)[prop];
    }
    const clean = prop.padStart(7, '0');
    return target[clean] || getCnaeInfoDinamico(clean);
  }
});

export const REGIOES_RJ: Record<string, string[]> = {
  CAPITAL: ['RIODEJANEIRO'],
  PETROPOLIS: ['PETROPOLIS'],
  NOROESTE: [
    'APERIBE', 'BOMJESUSDOITABAPOANA', 'CAMBUCI', 'ITALVA', 'ITAOCARA',
    'ITAPERUNA', 'LAJEDOMURIAE', 'MIRACEMA', 'NATIVIDADE', 'PORCIUNCULA',
    'SANTOANTONIODEPADUA', 'SAOJOSEDEUBA', 'VARRESAI'
  ],
  NORTE: [
    'CAMPOSDOSGOYTACAZES', 'CARAPEBUS', 'CARDOSOMOREIRA', 'CONCEICAODEMACABU',
    'MACAE', 'QUISSAMA', 'SAOFIDELIS', 'SAOFRANCISCODEITABAPOANA', 'SAOJOAODABARRA'
  ],
  BAIXADA: [
    'BELFORDROXO', 'DUQUEDECAXIAS', 'GUAPIMIRIM', 'ITAGUAI', 'JAPERI',
    'MAGE', 'MANGARATIBA', 'MESQUITA', 'NILOPOLIS', 'NOVAIGUACU',
    'PARACAMBI', 'QUEIMADOS', 'SAOJOAODEMERITI', 'SEROPEDICA'
  ],
  LESTE_LAGOS: [
    'NITEROI', 'SAOGONCALO', 'ITABORAI', 'MARICA', 'TANGUA', 'RIOBONITO',
    'SILVAJARDIM', 'ARARUAMA', 'ARMACAODOSBUZIOS', 'ARRAIALDOCABO',
    'CABOFRIO', 'CASIMIRODEABREU', 'IGUABAGRANDE', 'RIODASOSTRAS',
    'SAOPEDRODAALDEIA', 'SAQUAREMA', 'TERESOPOLIS'
  ],
  SERRANA: [
    'NOVAFRIBURGO', 'BOMJARDIM', 'CACHOEIRASDEMACACU', 'CANTAGALO',
    'CARMO', 'CORDEIRO', 'DUASBARRAS', 'MACUCO', 'SANTAMARIAMADALENA',
    'SAOSEBASTIAODOALTO', 'SUMIDOURO', 'TRAJANODEMORAIS'
  ],
  CENTRO_SUL: [
    'AREAL', 'COMENDADORLEVYGASPARIAN', 'PARAIBADOSUL',
    'SAOJOSEDOVALEDORIOPRETO', 'SAPUCAIA', 'TRESRIOS'
  ],
  SUL_MEDIO_PARAIBA: [
    'BARRADOPIRAI', 'BARRAMANSA', 'ENGENHEIROPAULODEOFRONTIN', 'ITATIAIA',
    'MENDES', 'MIGUELPEREIRA', 'PATYDOALFERES', 'PINHEIRAL', 'PIRAI',
    'PORTOREAL', 'QUATIS', 'RESENDE', 'RIOCLARO', 'RIODASFLORES',
    'VALENCA', 'VASSOURAS', 'VOLTAREDONDA', 'ANGRADOSREIS', 'PARATY'
  ]
};

export const SINDICATOS_CATALOGO: SindicatoItem[] = [
  // 17 Nacionais
  { sigla: 'SIMDE', nome: 'Sindicato Nacional das Indústrias de Materiais de Defesa - SIMDE', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: '2550101, 2550102, 2092401, 3050400, 3292201' },
  { sigla: 'SNIEC', nome: 'Sindicato Nacional da Indústria da Extração de Carvão - SNIEC', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: 'Divisão 05 (0500301, 0500302)' },
  { sigla: 'SINFERBASE', nome: 'Sindicato Nacional da Indústria da Extração do Ferro e Metais Básicos - SINFERBASE', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: '0710301, 0710302, 0721901, 0721902, 0723501, 0723502, 0729401-0729405, 0990401, 0990402' },
  { sigla: 'SNIEE', nome: 'Sindicato Nacional da Indústria da Extração do Estanho - SNIEE', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: '0722701, 0722702' },
  { sigla: 'SINDIRAÇÕES', nome: 'Sindicato Nacional da Indústria de Alimentação Animal - SINDIRAÇÕES', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: '1066000' },
  { sigla: 'SINDICERV', nome: 'Sindicato Nacional da Industria da Cerveja - SINDICERV', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: '1113502' },
  { sigla: 'SINDINAM', nome: 'Sindicato Nacional da Indústria de Águas Minerais - SINDINAM', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: '1099604, 1121600' },
  { sigla: 'SNIFOS', nome: 'Sindicato Nacional da Indústria de Fósforos - SNIFOS', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: '2092403' },
  { sigla: 'SINDAN', nome: 'Sindicato Nacional da Indústria de Produtos para a Saúde Animal - SINDAN', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: '2122000' },
  { sigla: 'SINFAVEA', nome: 'Sindicato Nacional da Indústria de Tratores, Caminhões, Automóveis e Veículos Similares - SINFAVEA', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: '2831300, 2853400, 2910701, 2920401, 3050400' },
  { sigla: 'SINDIPEÇAS', nome: 'Sindicato Nacional da Indústria de Componentes para Veículos Automotores - SINDIPEÇAS', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: '2910702, 2910703, 2920402, Divisão 294' },
  { sigla: 'SNIC', nome: 'Sind. Nacional da Ind. do Cimento - SNIC', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: '2320600' },
  { sigla: 'SINICON', nome: 'Sind. Nacional da Ind. da Construção Pesada - SINICON', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: '4291000, Obras Marítimas e Portuárias, Obras de Grande Porte' },
  { sigla: 'SINAVAL', nome: 'Sind. Nacional da Ind. da Construção Naval - SINAVAL', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: '3011301, 3011302, 3012100, 3317101, 3317102' },
  { sigla: 'SIND.AÇO', nome: 'Sindicato Nacional da Indústria de Aço - SIND.AÇO', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: 'Grupos 242, 243, 2451200, 2531401' },
  { sigla: 'SINALCALIS', nome: 'Sindicato Nacional da Indústria de Álcalis - SINALCALIS', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: '2011800' },
  { sigla: 'SIR - SINDREFRATARIO', nome: 'Sindicato Nacional da Indústria de Refratários - SIR - SINDREFRATARIO', ambito: 'Nacional', abrang: 'Todo o Território Nacional', cnaes: '2341900' },

  // 29 Estaduais do RJ
  { sigla: 'SIMARJ', nome: 'Sindicato dos Mineradores de Areia do Estado do Rio de Janeiro - SIMARJ', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '0600003, 0810006' },
  { sigla: 'SINDISAL', nome: 'Sindicato da Indústria de Refinação e Moagem de Sal do Estado do Rio de Janeiro - SINDISAL', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '0892403' },
  { sigla: 'SIPERJ', nome: 'Sindicato da Indústria do Pescado do Estado do Rio de Janeiro - SIPERJ', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '1020101, 1020102' },
  { sigla: 'SINDLAT', nome: 'Sindicato da Indústria de Laticínios e Produtos Derivados do Estado do Rio de Janeiro - SINDLAT', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '1051100, 1052000, 1053800' },
  { sigla: 'SINDITRIGO', nome: 'Sindicato das Indústrias de Trigo nos Estados do Rio de Janeiro e Espírito Santo - SINDITRIGO', ambito: 'Estadual RJ/ES', abrang: 'Estados do RJ e ES', cnaes: '1062700' },
  { sigla: 'SISERJ', nome: 'Sindicato da Indústria Sucroenergética do Estado do Rio de Janeiro - SISERJ', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '1071600, 1072401, 1072402, 1931400' },
  { sigla: 'SINCAFÉ', nome: 'Sind das Indústrias de Torrefação e Moagem de Café do Est do Rio de Janeiro - SINCAFÉ', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '1081301, 1081302, 1082100' },
  { sigla: 'SINDIFUMO', nome: 'Sindicato da Indústria do Fumo do Município do Rio de Janeiro - SINDIFUMO', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: 'Divisão 12 (1210700, 1220401-1220499)' },
  { sigla: 'SINDITÊXTIL', nome: 'Sindicato das Indústrias de Fiação e Tecelagem do Estado do Rio de Janeiro - SINDITÊXTIL', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: 'Divisão 13, 1421500, 1422300, 9601702 (exceto Capital)' },
  { sigla: 'SINFAR', nome: 'Sindicato da Indústria de Produtos Farmacêuticos do Estado do Rio de Janeiro - SINFAR', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '2110600, 2121101-2121103, 3250705' },
  { sigla: 'SIPATERJ', nome: 'Sindicato da Indústria de Produtos Cosméticos e Higiene Pessoal no Estado do Rio Janeiro - SIPATERJ', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '2063100' },
  { sigla: 'SIMPERJ', nome: 'Sindicato da Indústria de Material Plástico do Estado do Rio de Janeiro - SIMPERJ', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: 'Divisão 222 (2221800-2229399), 3832700' },
  { sigla: 'SINDBORJ', nome: 'Sindicato das Indústrias de Artefatos de Borracha do Estado do Rio de Janeiro - SINDBORJ', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '2211100, 2212900, 2219600' },
  { sigla: 'SINDITEC', nome: 'Sind da Ind Eletrônica, Informática, Telecomunicações, Componentes e Similares no Estado do RJ - SINDITEC', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '1830001-1830003, Grupos 261, 262, 263, 264, 2651, 2660, Divisões 61 e 62, 3299004' },
  { sigla: 'SICAV', nome: 'Sindicato Interestadual da Indústria Audiovisual - SICAV', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '5911101, 5911102, 5911199, 5912001, 5912002, 5912099, 5920100, 6022501' },
  { sigla: 'SINERGIA', nome: 'Sindicato Interestadual das Indústrias de Energia Elétrica - SINERGIA', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '3511501, 3511502, 3512300, 3513100, 3514000' },
  { sigla: 'SINDISTAL', nome: 'Sindicato da Indústria de Instalações Elétricas, Gás, Hidráulicas e Sanitárias do Estado do Rio de Janeiro - SINDISTAL', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '4221903, 4321500, 4322301, 4322303, 4329101-4329199' },
  { sigla: 'SINDIREPA', nome: 'Sindicato da Indústria de Reparação de Veículos e Acessórios do Estado do Rio de Janeiro - SINDIREPA', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '2950600, 4520001, 4520002, 4520003, 4520004, 4520006, 4520007, 4520008, 4530703, 4530704, 4543900' },
  { sigla: 'SINDJOIAS', nome: 'Sindicato das Indústrias da Joalheria e Lapidação de Pedras Preciosas do Estado do Rio de Janeiro - SINDJOIAS', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '2652300, 3211601, 3211602, 3211603, 3212400' },
  { sigla: 'SINDIVIDROS', nome: 'Sindicato da Indústria de Vidros, Cristais e Espelhos do Estado do Rio de Janeiro - SINDIVIDROS', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '2311700, 2312500, 2319200, 2399101' },
  { sigla: 'SINDRATAR', nome: 'Sindicato das Indústrias de Refrigeração, Aquecimento e Tratamento de Ar do Estado do Rio de Janeiro - SINDRATAR', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '2823200, 2824101, 2824102, 3314706, 3314707, 4322302' },
  { sigla: 'SINDICAPEL', nome: 'Sindicato da Indústria do Papel, Celulose e Pasta de Madeira para Papel no Estado do Rio de Janeiro - SINDICAPEL', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '1710900, 1721400, 1722200' },
  { sigla: 'SINPAPEL', nome: 'Sindicato da Indústria de Artefatos de Papel, Papelão e Cortiça do Estado do Rio de Janeiro - SINPAPEL', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: 'Grupo 173 (1731100-1733800), 1741901, 1741902, 1742701, 1742702, 1742799, 1749400' },
  { sigla: 'RODOFERRO', nome: 'Sind das Inds de Materiais e Equipamentos Rodoviários e Ferroviários do Est do Rio de Janeiro - RODOFERRO', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '2930101-2930103, Divisão 303, 3091101, 3091102, 3315500' },
  { sigla: 'SIMAGRAN', nome: 'Sind da Ind de Mármores, Granitos e Rochas Afins do Estado do Rio de Janeiro - SIMAGRAN', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro (exceto Baixada e Costa Verde)', cnaes: '2391503, 2399102, 4679602' },
  { sigla: 'INDUSCIMENTO', nome: 'Sind Inds de Artefatos de Cimento Armado, Ladrilhos Hidrául e Prod de Cimento do Est do RJ - INDUSCIMENTO', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: '2330301-2330399' },
  { sigla: 'SIQUIRJ', nome: 'Sindicato da Indústria de Produtos Químicos para Fins Industriais do Estado do RJ - SIQUIRJ', ambito: 'Estadual RJ', abrang: 'Estado do Rio de Janeiro', cnaes: 'Divisões 19 e 20 (exceto específicos), 3299002, 3839401, 3839499' },
  { sigla: 'SIGRARJ', nome: 'Sindicato das Indústrias Gráficas do Estado do Rio de Janeiro - SIGRARJ', ambito: 'Estadual RJ', abrang: 'Municípios do RJ sem sindicato gráfico municipal', cnaes: 'Divisão 181, 182, 581, 582' },
  { sigla: 'RJ METAL', nome: 'Sindicato das Indústrias Metalúrgicas, Mecânicas e de Material Elétrico no Estado do Rio de Janeiro - RJ METAL', ambito: 'Estadual RJ', abrang: 'Municípios do RJ sem representação metalmecânica específica', cnaes: 'Divisões 24, 25, 27, 28, 30, 33, 3831901' },

  // 55 Regionais e Municipais do Rio de Janeiro
  { sigla: 'SINDGNAISSES', nome: 'Sind das Ind e Extratores de Pedras Gnaisses no Noroeste do Estado do Rio de Janeiro - SINDGNAISSES', ambito: 'Regional', abrang: 'Região Noroeste Fluminense', cnaes: '0810099' },
  { sigla: 'SINDIBRITA', nome: 'Sind da Indústria de Mineração de Brita no Estado do Rio de Janeiro - SINDIBRITA', ambito: 'Estadual RJ', abrang: 'Municípios do RJ (exceto Noroeste)', cnaes: '0810099' },
  { sigla: 'SICCC', nome: 'Sindicato da Indústria de Cerâmica para Construção de Campos - SICCC', ambito: 'Regional', abrang: 'Campos dos Goytacazes e Norte Fluminense', cnaes: '2342701, 2342702, 2349401, 2349499' },
  { sigla: 'SINDICER MVP', nome: 'Sindicato da Indústria de Cerâmica para Construção e Olaria do Médio Vale do Paraíba - SINDICER MVP', ambito: 'Regional', abrang: 'Sul Fluminense e Médio Paraíba', cnaes: '2342701, 2342702, 2349401, 2349499' },
  { sigla: 'SINDICER RJ', nome: 'Sindicato da Indústria de Cerâmica para Construção e de Olaria do Estado do Rio de Janeiro - SINDICER RJ', ambito: 'Estadual RJ', abrang: 'Demais regiões do Estado do RJ', cnaes: '2342701, 2342702, 2349401, 2349499' },
  { sigla: 'SIM-RIO', nome: 'Sind Ind Móv Mad Junco Vime Serrar Carpint Tanoaria Mad Compens e Lamin Aglom Chapa do Mun RJ - SIM-RIO', ambito: 'Municipal', abrang: 'Rio de Janeiro (Capital)', cnaes: 'Divisão 16, 3101200, 3103900, 3104700, 3291400, 3329501' },
  { sigla: 'SINDMARCENARIA', nome: 'Sindicato da Indústria de Marcenaria, Móveis de Madeira, Serrarias, Carpintarias e Tanoarias de Petrópolis - SINDMARCENARIA', ambito: 'Municipal', abrang: 'Petrópolis', cnaes: 'Divisão 16, 3101200, 3103900, 3104700, 3291400, 3329501' },
  { sigla: 'SINDIMOB', nome: 'Sindicato da Indústria do Mobiliário de Campos dos Goytacazes - SINDIMOB', ambito: 'Regional', abrang: 'Campos dos Goytacazes e Norte Fluminense', cnaes: 'Divisão 16, 3101200, 3103900, 3104700, 3291400, 3329501' },
  { sigla: 'SINDUSCON RIO', nome: 'Sindicato da Indústria da Construção Civil no Estado do Rio de Janeiro - SINDUSCON RIO', ambito: 'Municipal', abrang: 'Rio de Janeiro (Capital)', cnaes: 'Divisão 41, 4292, 4299, 433, 439, 711, 9102302' },
  { sigla: 'SINDUSCON PETROPOLIS', nome: 'Sindicato da Indústria da Construção Civil de Petrópolis - SINDUSCON PETROPOLIS', ambito: 'Municipal', abrang: 'Petrópolis', cnaes: 'Divisão 41, 4292, 4299, 433, 439, 711, 9102302' },
  { sigla: 'SINDICON', nome: 'Sindicato das Indústrias da Construção Civil e Engenharia Consultiva de Niterói - SINDICON', ambito: 'Municipal', abrang: 'Niterói', cnaes: 'Divisão 41, 4292, 4299, 433, 439, 711, 9102302' },
  { sigla: 'SINCOCIMO', nome: 'Sindicato das Indústrias da Construção e Mobiliário de Duque de Caxias - SINCOCIMO', ambito: 'Regional', abrang: 'Duque de Caxias, Baixada Fluminense e Costa Verde (Mármores)', cnaes: 'Divisões 41, 43, 16, 31, 0810003, 2391503' },
  { sigla: 'SINDICEM', nome: 'Sindicato das Indústrias da Construção, Engenharia Consultiva e do Mobiliário de Niterói a Cabo Frio - SINDICEM', ambito: 'Regional', abrang: 'São Gonçalo, Cabo Frio e Leste/Lagos', cnaes: 'Divisões 41, 43, 16, 31 (Leste Fluminense/Lagos)' },
  { sigla: 'SINDUSCON CN', nome: 'Sindicato da Indústria da Construção Civil do Centro Norte Fluminense - SINDUSCON CN', ambito: 'Regional', abrang: 'Nova Friburgo e Região Serrana', cnaes: 'Divisão 41, 4292, 4299, 433, 439, 711, 9102302' },
  { sigla: 'SINDUSCON NORTE', nome: 'Sindicato da Indústria da Construção Civil do Norte Fluminense - SINDUSCON NORTE', ambito: 'Regional', abrang: 'Campos dos Goytacazes e Norte Fluminense', cnaes: 'Divisão 41, 4292, 4299, 433, 439, 711, 9102302' },
  { sigla: 'SINDUSCON NOROESTE', nome: 'Sind das Inds da Constr Civil, Montagens Industriais e Engª Consultiva no Noroeste do Est do RJ - SINDUSCON NOROESTE', ambito: 'Regional', abrang: 'Itaperuna e Noroeste Fluminense', cnaes: 'Divisão 41, 4292, 4299, 433, 439, 711, 9102302' },
  { sigla: 'SINDICOM TR', nome: 'Sindicato das Indústrias da Construção Civil e do Mobiliário de Três Rios, P.Sul, Areal, Com.Levy Gasparian e Sapucaia - SINDICOM TR', ambito: 'Regional', abrang: 'Três Rios e Centro-Sul Fluminense', cnaes: 'Divisões 41, 43, 16, 31 (Centro-Sul)' },
  { sigla: 'SINDUSCON SUL', nome: 'Sindicato das Indústrias da Construção e do Mobiliário de Volta Redonda - SINDUSCON SUL', ambito: 'Regional', abrang: 'Volta Redonda e Sul Fluminense', cnaes: 'Divisões 41, 43, 16, 31 (Sul Fluminense)' },
  { sigla: 'SINMETAL', nome: 'Sindicato das Indústrias Metalúrgicas do Município do Rio de Janeiro - SINMETAL', ambito: 'Municipal', abrang: 'Rio de Janeiro (Capital)', cnaes: 'Divisões 24 e 25 (exceto Nacional)' },
  { sigla: 'SIMME', nome: 'Sindicato das Indústrias Mecânicas e de Material Elétrico do Município do Rio de Janeiro - SIMME', ambito: 'Municipal', abrang: 'Rio de Janeiro (Capital)', cnaes: 'Divisões 27, 28, 30, 3102100, 33, 3831901' },
  { sigla: 'SIMMEC', nome: 'Sind Ind Metalúrgicas, Mecânicas e de Mat Elétrico dos Mun de D de Caxias, S J de Meriti e Nilópolis - SIMMEC', ambito: 'Regional', abrang: 'Duque de Caxias, São João de Meriti e Nilópolis', cnaes: 'Divisões 24, 25, 27, 28, 30, 33' },
  { sigla: 'METALSUL', nome: 'Sind. Inds. Metal, Mec, Automot, de Info e de Mat. Eletro-Eletrônico Médio Paraíba e Sul Fluminense - METALSUL', ambito: 'Regional', abrang: 'Volta Redonda, Resende, Barra Mansa e Sul Fluminense', cnaes: 'Divisões 24, 25, 27, 28, 30, 33' },
  { sigla: 'SINDMETAL', nome: 'Sindicato das Indústrias Metalúrgicas, Mecânicas e de Material Elétrico de Nova Friburgo - SINDMETAL', ambito: 'Municipal', abrang: 'Nova Friburgo e Região Serrana', cnaes: 'Divisões 24, 25, 27, 28, 30, 33' },
  { sigla: 'SINDMMEP', nome: 'Sindicato das Indústrias Metalúrgicas, Mecânicas e de Material Elétrico de Petrópolis - SINDMMEP', ambito: 'Municipal', abrang: 'Petrópolis', cnaes: 'Divisões 24, 25, 27, 28, 30, 33' },
  { sigla: 'SINDMEC', nome: 'Sindicato das Indústrias Metalúrgicas, Mecânicas e de Material Elétrico de Campos - SINDMEC', ambito: 'Regional', abrang: 'Campos dos Goytacazes e Norte Fluminense', cnaes: 'Divisões 24, 25, 27, 28, 30, 33' },
  { sigla: 'SINDMETAL NOROESTE', nome: 'Sindicato das Indústrias Metalúrgicas, Mecânicas e de Mat Elétrico no Noroeste do Est do Rio de Janeiro - SINDMETAL NOROESTE', ambito: 'Regional', abrang: 'Itaperuna e Noroeste Fluminense', cnaes: 'Divisões 24, 25, 27, 28, 30, 33' },
  { sigla: 'RIO+PÃO', nome: 'Sindicato da Indústria de Panificação e Confeitaria do Município do Rio de Janeiro - RIO+PÃO', ambito: 'Municipal', abrang: 'Rio de Janeiro (Capital)', cnaes: '1091100, 1091101, 1091102, 4721102' },
  { sigla: 'SINDPÃES', nome: 'Sindicato das Indústrias de Panificação e Confeitaria de Petrópolis - SINDPÃES', ambito: 'Municipal', abrang: 'Petrópolis', cnaes: '1091100, 1091101, 1091102, 4721102' },
  { sigla: 'SINDPANIFIC', nome: 'Sindicato das Indústrias de Panificação e Confeitaria de Niterói e São Gonçalo - SINDPANIFIC', ambito: 'Regional', abrang: 'Niterói, São Gonçalo, Itaboraí, Teresópolis', cnaes: '1091100, 1091101, 1091102, 4721102' },
  { sigla: 'SIPACON', nome: 'Sindicato das Indústrias de Panificação e Confeitaria da Região Sul do Estado do Rio de Janeiro - SIPACON', ambito: 'Regional', abrang: 'Volta Redonda e Sul Fluminense', cnaes: '1091100, 1091101, 1091102, 4721102' },
  { sigla: 'SIARJ', nome: 'Sindicato das Indústrias de Alimentos do Município do Rio de Janeiro - SIARJ', ambito: 'Municipal', abrang: 'Rio de Janeiro (Capital)', cnaes: 'Divisão 10 (exceto panificação), 11' },
  { sigla: 'SINDCER', nome: 'Sind das Inds de Cerv e Beb em Geral, Prod Cacau, Balas, Doces, Conserv Aliment e Biscot de Petrópolis - SINDCER', ambito: 'Municipal', abrang: 'Petrópolis e Teresópolis', cnaes: 'Divisões 10 e 11' },
  { sigla: 'SINDBEBI', nome: 'Sindicato Intermunicipal da Indústria de Bebidas em Geral do Rio de Janeiro - SINDBEBI', ambito: 'Regional', abrang: 'Rio de Janeiro e Municípios Conveniados', cnaes: 'Divisão 11 (Bebidas em geral)' },
  { sigla: 'SIMAPAN', nome: 'Sind. Inds. de Massas Alimentícias, Panificação e Afins da Baixada Fluminense - SIMAPAN', ambito: 'Regional', abrang: 'Duque de Caxias e Baixada Fluminense', cnaes: 'Divisão 10, Panificação e Massas' },
  { sigla: 'SIAN', nome: 'Sindicato das Indústrias de Alimentação de Niterói - SIAN', ambito: 'Regional', abrang: 'Niterói, São Gonçalo e Região dos Lagos', cnaes: 'Divisão 10 (exceto panificação direta), 11' },
  { sigla: 'SINDANF', nome: 'Sindicato das Indústrias de Alimentação de Nova Friburgo - SINDANF', ambito: 'Regional', abrang: 'Nova Friburgo e Região Serrana', cnaes: 'Divisões 10 e 11' },
  { sigla: 'SIPAL', nome: 'Sind Ind Panif Conf Prod Cacau Balas Massas Alim Bisc Cerv Beb Geral Doces e Conservas de Campos - SIPAL', ambito: 'Regional', abrang: 'Campos dos Goytacazes e Norte Fluminense', cnaes: 'Divisões 10 e 11' },
  { sigla: 'SIANERJ', nome: 'Sindicato das Indústrias de Alimentação no Noroeste do Estado do Rio de Janeiro - SIANERJ', ambito: 'Regional', abrang: 'Itaperuna e Noroeste Fluminense', cnaes: 'Divisões 10 e 11' },
  { sigla: 'SINDAL', nome: 'Sind Ind de Alimentação Três Rios, Paraib. do Sul, Sapucaia, Areal, Com.Levy Gaspa e S J V do R.Preto - SINDAL', ambito: 'Regional', abrang: 'Três Rios e Centro-Sul', cnaes: 'Divisões 10 e 11' },
  { sigla: 'SINDICALÇADOS', nome: 'Sindicato das Indústrias de Calçados e de Bolsas, Luvas e Similares do Município do Rio de Janeiro - SINDICALÇADOS', ambito: 'Municipal', abrang: 'Rio de Janeiro (Capital)', cnaes: 'Divisão 15' },
  { sigla: 'SINDCON', nome: 'Sind da Indústria de Confecção de Roupas e Chapéus de Senhoras de Petrópolis - SINDCON', ambito: 'Municipal', abrang: 'Petrópolis', cnaes: 'Divisão 14' },
  { sigla: 'SINDICONF', nome: 'Sindicato da Indústria de Alfaiataria e de Confecção de Roupas de Homem de Niterói - SINDICONF', ambito: 'Municipal', abrang: 'Niterói', cnaes: 'Divisão 14' },
  { sigla: 'SINDVEST', nome: 'Sindicato das Indústrias do Vestuário de Nova Friburgo - SINDVEST', ambito: 'Municipal', abrang: 'Nova Friburgo', cnaes: 'Divisão 14' },
  { sigla: 'SINDVEST NORTE', nome: 'Sindicato da Indústria do Vestuário do Norte Fluminense - SINDVEST NORTE', ambito: 'Regional', abrang: 'Campos dos Goytacazes e Norte Fluminense', cnaes: 'Divisão 14' },
  { sigla: 'SINCRONERJ', nome: 'Sindicato das Indústrias de Confecções de Roupas no Noroeste do Estado do Rio de Janeiro - SINCRONERJ', ambito: 'Regional', abrang: 'Itaperuna e Noroeste Fluminense', cnaes: 'Divisão 14' },
  { sigla: 'MODA RIO', nome: 'Sindicato das Indústrias de Vestuário do Rio de Janeiro e Grande Rio - MODA RIO', ambito: 'Regional', abrang: 'Rio de Janeiro e Grande Rio', cnaes: 'Divisão 14, 3292202, 3299005' },
  { sigla: 'SINTINTURARIAS', nome: 'Sindicato da Indústria da Tinturaria do Vestuário no Município do Rio de Janeiro - SINTINTURARIAS', ambito: 'Municipal', abrang: 'Rio de Janeiro (Capital)', cnaes: '1340501, 1340502, 1340599, 9601701, 9601702' },
  { sigla: 'SIGRAF', nome: 'Sindicato das Indústrias Gráficas do Município do Rio de Janeiro - SIGRAF', ambito: 'Municipal', abrang: 'Rio de Janeiro (Capital)', cnaes: 'Divisões 181, 182, 581, 582' },
  { sigla: 'SIGRAP', nome: 'Sindicato das Indústrias Gráficas de Petrópolis - SIGRAP', ambito: 'Municipal', abrang: 'Petrópolis', cnaes: 'Divisões 181, 182, 581, 582' },
  { sigla: 'SINDGRAF', nome: 'Sindicato das Indústrias Gráficas de Nova Friburgo - SINDGRAF', ambito: 'Municipal', abrang: 'Nova Friburgo', cnaes: 'Divisões 181, 182, 581, 582' },
  { sigla: 'SINDGRAF CAMPOS', nome: 'Sindicato das Indústrias Gráficas de Campos - SINDGRAF CAMPOS', ambito: 'Regional', abrang: 'Campos e Norte Fluminense', cnaes: 'Divisões 181, 182, 581, 582' },
  { sigla: 'SINDGRAF NOROESTE', nome: 'Sindicato das Indústrias Gráficas no Noroeste do Estado do Rio de Janeiro - SINDGRAF NOROESTE', ambito: 'Regional', abrang: 'Itaperuna e Noroeste Fluminense', cnaes: 'Divisões 181, 182, 581, 582' },
  { sigla: 'SINGRASUL', nome: 'Sindicato das Indústrias Gráficas do Sul Fluminense - SINGRASUL', ambito: 'Regional', abrang: 'Volta Redonda e Sul Fluminense', cnaes: 'Divisões 181, 182, 581, 582' },
  { sigla: 'SINTIRJ', nome: 'Sind das Inds de Tintas e Vernizes e de Preparação de Óleos Vegetais e Animais do Mun do RJ - SINTIRJ', ambito: 'Municipal', abrang: 'Rio de Janeiro (Capital)', cnaes: '2071100, 2072000, 2091600, 3299002' },
  { sigla: 'SISAVERJ', nome: 'Sindicato da Indústria de Sabão e Velas do Município RJ - SISAVERJ', ambito: 'Municipal', abrang: 'Rio de Janeiro (Capital)', cnaes: '2061400, 3299006' }
];

export const SINDICATOS_NACIONAIS = [
  { prefix: [/^2550101/, /^2550102/, /^2092401/, /^3050400/, /^3292201/], nome: 'Sindicato Nacional das Indústrias de Materiais de Defesa - SIMDE', regra: 'Abrangência Nacional' },
  { prefix: [/^05/], nome: 'Sindicato Nacional da Indústria da Extração de Carvão - SNIEC', regra: 'Abrangência Nacional' },
  { prefix: [/^0710/, /^0721/, /^0723/, /^0729/, /^0990401/, /^0990402/], nome: 'Sindicato Nacional da Indústria da Extração do Ferro e Metais Básicos - SINFERBASE', regra: 'Abrangência Nacional' },
  { prefix: [/^0722/], nome: 'Sindicato Nacional da Indústria da Extração do Estanho - SNIEE', regra: 'Abrangência Nacional' },
  { prefix: [/^1066/], nome: 'Sindicato Nacional da Indústria de Alimentação Animal - SINDIRAÇÕES', regra: 'Abrangência Nacional' },
  { prefix: [/^1113502/], nome: 'Sindicato Nacional da Industria da Cerveja - SINDICERV', regra: 'Abrangência Nacional' },
  { prefix: [/^1099604/, /^1121600/], nome: 'Sindicato Nacional da Indústria de Águas Minerais - SINDINAM', regra: 'Abrangência Nacional' },
  { prefix: [/^2092403/], nome: 'Sindicato Nacional da Indústria de Fósforos - SNIFOS', regra: 'Abrangência Nacional' },
  { prefix: [/^2122000/], nome: 'Sindicato Nacional da Indústria de Produtos para a Saúde Animal - SINDAN', regra: 'Abrangência Nacional' },
  { prefix: [/^2831300/, /^2853400/, /^2910701/, /^2920401/, /^3050400/], nome: 'Sindicato Nacional da Indústria de Tratores, Caminhões, Automóveis e Veículos Similares - SINFAVEA', regra: 'Abrangência Nacional' },
  { prefix: [/^2910702/, /^2910703/, /^2920402/, /^294/], nome: 'Sindicato Nacional da Indústria de Componentes para Veículos Automotores - SINDIPEÇAS', regra: 'Abrangência Nacional' },
  { prefix: [/^2320600/], nome: 'Sind. Nacional da Ind. do Cimento - SNIC', regra: 'Abrangência Nacional' },
  { prefix: [/^2341900/], nome: 'Sindicato Nacional da Indústria de Refratários - SIR - SINDREFRATARIO', regra: 'Abrangência Nacional' },
  { prefix: [/^4291000/], nome: 'Sind. Nacional da Ind. da Construção Pesada - SINICON', regra: 'Abrangência Nacional (Obras Portuárias e Marítimas)' },
  { prefix: [/^3011/, /^3012/, /^33171/], nome: 'Sind. Nacional da Ind. da Construção Naval - SINAVAL', regra: 'Abrangência Nacional' },
  { prefix: [/^242/, /^243/, /^2451/, /^2531401/], nome: 'Sindicato Nacional da Indústria de Aço - SIND.AÇO', regra: 'Abrangência Nacional' },
  { prefix: [/^2011800/], nome: 'Sindicato Nacional da Indústria de Álcalis - SINALCALIS', regra: 'Abrangência Nacional' }
];

export const SINDICATOS_ESTADUAIS_RJ = [
  { prefix: [/^0600003/, /^0810006/], nome: 'Sindicato dos Mineradores de Areia do Estado do Rio de Janeiro - SIMARJ', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^0892403/], nome: 'Sindicato da Indústria de Refinação e Moagem de Sal do Estado do Rio de Janeiro - SINDISAL', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^10201/], nome: 'Sindicato da Indústria do Pescado do Estado do Rio de Janeiro - SIPERJ', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^1051/, /^1052/, /^1053/], nome: 'Sindicato da Indústria de Laticínios e Produtos Derivados do Estado do Rio de Janeiro - SINDLAT', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^10627/], nome: 'Sindicato das Indústrias de Trigo nos Estados do Rio de Janeiro e Espírito Santo - SINDITRIGO', regra: 'Abrangência Estadual (RJ/ES)' },
  { prefix: [/^10716/, /^10724/, /^19314/], nome: 'Sindicato da Indústria Sucroenergética do Estado do Rio de Janeiro - SISERJ', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^10813/, /^10821/], nome: 'Sind das Indústrias de Torrefação e Moagem de Café do Est do Rio de Janeiro - SINCAFÉ', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^12107/, /^12204/], nome: 'Sindicato da Indústria do Fumo do Município do Rio de Janeiro - SINDIFUMO', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^131/, /^132/, /^133/, /^134/, /^135/, /^1421/, /^1422/], nome: 'Sindicato das Indústrias de Fiação e Tecelagem do Estado do Rio de Janeiro - SINDITÊXTIL', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^21106/, /^21211/, /^3250705/], nome: 'Sindicato da Indústria de Produtos Farmacêuticos do Estado do Rio de Janeiro - SINFAR', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^20631/], nome: 'Sindicato da Indústria de Produtos Cosméticos e Higiene Pessoal no Estado do Rio Janeiro - SIPATERJ', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^222/, /^38327/], nome: 'Sindicato da Indústria de Material Plástico do Estado do Rio de Janeiro - SIMPERJ', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^2211/, /^2212/, /^2219/], nome: 'Sindicato das Indústrias de Artefatos de Borracha do Estado do Rio de Janeiro - SINDBORJ', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^18300/, /^261/, /^262/, /^263/, /^264/, /^2651/, /^2660/, /^611/, /^612/, /^613/, /^619/, /^62015/, /^62023/, /^62031/, /^3299004/], nome: 'Sind da Ind Eletrônica, Informática, Telecomunicações, Componentes e Similares no Estado do RJ - SINDITEC', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^59111/, /^59120/, /^59201/, /^6022501/], nome: 'Sindicato Interestadual da Indústria Audiovisual - SICAV', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^3511501/, /^3511502/, /^35123/, /^35131/, /^35140/], nome: 'Sindicato Interestadual das Indústrias de Energia Elétrica - SINERGIA', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^4221903/, /^43215/, /^4322301/, /^4322303/, /^43291/], nome: 'Sindicato da Indústria de Instalações Elétricas, Gás, Hidráulicas e Sanitárias do Estado do Rio de Janeiro - SINDISTAL', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^2950600/, /^4520001/, /^4520002/, /^4520003/, /^4520004/, /^4520006/, /^4520007/, /^4520008/, /^4530703/, /^4530704/, /^4543900/], nome: 'Sindicato da Indústria de Reparação de Veículos e Acessórios do Estado do Rio de Janeiro - SINDIREPA', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^26523/, /^32116/, /^32124/], nome: 'Sindicato das Indústrias da Joalheria e Lapidação de Pedras Preciosas do Estado do Rio de Janeiro - SINDJOIAS', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^23117/, /^23125/, /^23192/, /^2399101/], nome: 'Sindicato da Indústria de Vidros, Cristais e Espelhos do Estado do Rio de Janeiro - SINDIVIDROS', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^28232/, /^28241/, /^3314706/, /^3314707/, /^4322302/], nome: 'Sindicato das Indústrias de Refrigeração, Aquecimento e Tratamento de Ar do Estado do Rio de Janeiro - SINDRATAR', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^17109/, /^17214/, /^17222/], nome: 'Sindicato da Indústria do Papel, Celulose e Pasta de Madeira para Papel no Estado do Rio de Janeiro - SINDICAPEL', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^173/, /^174/], nome: 'Sindicato da Indústria de Artefatos de Papel, Papelão e Cortiça do Estado do Rio de Janeiro - SINPAPEL', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^29301/, /^303/, /^3091101/, /^3091102/, /^33155/], nome: 'Sind das Inds de Materiais e Equipamentos Rodoviários e Ferroviários do Est do Rio de Janeiro - RODOFERRO', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^2391503/, /^2399102/, /^4679602/], nome: 'Sind da Ind de Mármores, Granitos e Rochas Afins do Estado do Rio de Janeiro - SIMAGRAN', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^23303/], nome: 'Sind Inds de Artefatos de Cimento Armado, Ladrilhos Hidrául e Prod de Cimento do Est do RJ - INDUSCIMENTO', regra: 'Abrangência Estadual (RJ)' },
  { prefix: [/^191/, /^192/, /^1932/, /^2012/, /^2013/, /^2014/, /^2019/, /^202/, /^203/, /^204/, /^205/, /^2062/, /^2073/, /^2091/, /^20924/, /^2093/, /^2094/, /^2099/, /^3299002/, /^3839401/, /^3839499/], nome: 'Sindicato da Indústria de Produtos Químicos para Fins Industriais do Estado do RJ - SIQUIRJ', regra: 'Abrangência Estadual (RJ)' }
];

export interface EnquadramentoMatch {
  sindicato: string;
  regra: string;
  situacao: 'Enquadrado' | 'Consultar Especialista';
}

export function buscarSindicatosParaCnae(cnaeRaw: string, municipio: string, uf: string): EnquadramentoMatch[] {
  const cnae = cleanNumber(cnaeRaw);
  const munNorm = cleanText(municipio);
  const ufNorm = cleanText(uf);

  if (!cnae || cnae.length < 5) return [];

  const cnaeInfo = baseCNAEs[cnae];
  if (cnaeInfo && cnaeInfo.assoc !== 'Sindicato') {
    return [];
  }

  const matches: EnquadramentoMatch[] = [];

  // 1. Nacionais
  for (const s of SINDICATOS_NACIONAIS) {
    if (s.prefix.some(p => p.test(cnae))) {
      matches.push({ sindicato: s.nome, regra: s.regra, situacao: 'Enquadrado' });
    }
  }

  if (ufNorm !== 'RJ') {
    return matches;
  }

  // 2. Estaduais RJ
  for (const s of SINDICATOS_ESTADUAIS_RJ) {
    if (s.prefix.some(p => p.test(cnae))) {
      if ((cnae === '0810003' || cnae === '2391503') && (REGIOES_RJ.BAIXADA.includes(munNorm) || ['ANGRADOSREIS', 'PARATY', 'MANGARATIBA'].includes(munNorm))) {
        continue;
      }
      if (!matches.some(m => m.sindicato === s.nome)) {
        matches.push({ sindicato: s.nome, regra: s.regra, situacao: 'Enquadrado' });
      }
    }
  }

  // 3. Regionais RJ
  if ((cnae === '0810003' || cnae === '2391503') && (REGIOES_RJ.BAIXADA.includes(munNorm) || ['ANGRADOSREIS', 'PARATY', 'MANGARATIBA'].includes(munNorm))) {
    matches.push({ sindicato: 'Sindicato das Indústrias da Construção e Mobiliário de Duque de Caxias - SINCOCIMO', regra: `Abrangência Regional (${municipio} - Mármores na Baixada/Costa Verde)`, situacao: 'Enquadrado' });
  }

  if (cnae.startsWith('0810099')) {
    if (REGIOES_RJ.NOROESTE.includes(munNorm)) {
      matches.push({ sindicato: 'Sind das Ind e Extratores de Pedras Gnaisses no Noroeste do Estado do Rio de Janeiro - SINDGNAISSES', regra: `Abrangência Regional (${municipio} - Noroeste Fluminense)`, situacao: 'Enquadrado' });
    } else {
      matches.push({ sindicato: 'Sind da Indústria de Mineração de Brita no Estado do Rio de Janeiro - SINDIBRITA', regra: 'Abrangência Estadual (RJ)', situacao: 'Enquadrado' });
    }
  }

  if (cnae.startsWith('23427') || cnae.startsWith('23494')) {
    if (REGIOES_RJ.NORTE.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato da Indústria de Cerâmica para Construção de Campos - SICCC', regra: `Abrangência Regional (${municipio} - Norte Fluminense)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.SUL_MEDIO_PARAIBA.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato da Indústria de Cerâmica para Construção e Olaria do Médio Vale do Paraíba - SINDICER MVP', regra: `Abrangência Regional (${municipio} - Médio Paraíba)`, situacao: 'Enquadrado' });
    } else {
      matches.push({ sindicato: 'Sindicato da Indústria de Cerâmica para Construção e de Olaria do Estado do Rio de Janeiro - SINDICER RJ', regra: 'Abrangência Estadual (RJ)', situacao: 'Enquadrado' });
    }
  }

  if (cnae.startsWith('10') || cnae.startsWith('11') || cnae.startsWith('4721102') || cnae.startsWith('5620101')) {
    if (cnae.startsWith('10911') || cnae.startsWith('4721102')) {
      if (munNorm === 'RIODEJANEIRO') {
        matches.push({ sindicato: 'Sindicato da Indústria de Panificação e Confeitaria do Município do Rio de Janeiro - RIO+PÃO', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
      } else if (munNorm === 'PETROPOLIS') {
        matches.push({ sindicato: 'Sindicato das Indústrias de Panificação e Confeitaria de Petrópolis - SINDPÃES', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
      } else if (['NITEROI', 'SAOGONCALO', 'ITABORAI', 'TERESOPOLIS'].includes(munNorm)) {
        matches.push({ sindicato: 'Sindicato das Indústrias de Panificação e Confeitaria de Niterói e São Gonçalo - SINDPANIFIC', regra: `Abrangência Regional (${municipio})`, situacao: 'Enquadrado' });
      } else if (REGIOES_RJ.SUL_MEDIO_PARAIBA.includes(munNorm)) {
        matches.push({ sindicato: 'Sindicato das Indústrias de Panificação e Confeitaria da Região Sul do Estado do Rio de Janeiro - SIPACON', regra: `Abrangência Regional (${municipio} - Sul Fluminense)`, situacao: 'Enquadrado' });
      } else if (REGIOES_RJ.BAIXADA.includes(munNorm)) {
        matches.push({ sindicato: 'Sind. Inds. de Massas Alimentícias, Panificação e Afins da Baixada Fluminense - SIMAPAN', regra: `Abrangência Regional (${municipio} - Baixada Fluminense)`, situacao: 'Enquadrado' });
      } else if (REGIOES_RJ.NORTE.includes(munNorm)) {
        matches.push({ sindicato: 'Sind Ind Panif Conf Prod Cacau Balas Massas Alim Bisc Cerv Beb Geral Doces e Conservas de Campos - SIPAL', regra: `Abrangência Regional (${municipio} - Norte Fluminense)`, situacao: 'Enquadrado' });
      } else if (REGIOES_RJ.NOROESTE.includes(munNorm)) {
        matches.push({ sindicato: 'Sindicato das Indústrias de Alimentação no Noroeste do Estado do Rio de Janeiro - SIANERJ', regra: `Abrangência Regional (${municipio} - Noroeste Fluminense)`, situacao: 'Enquadrado' });
      } else if (REGIOES_RJ.CENTRO_SUL.includes(munNorm)) {
        matches.push({ sindicato: 'Sind Ind de Alimentação Três Rios, Paraib. do Sul, Sapucaia, Areal, Com.Levy Gaspa e S J V do R.Preto - SINDAL', regra: `Abrangência Regional (${municipio} - Centro-Sul)`, situacao: 'Enquadrado' });
      }
    } else {
      if (munNorm === 'RIODEJANEIRO') {
        if (cnae.startsWith('11')) {
          matches.push({ sindicato: 'Sindicato Intermunicipal da Indústria de Bebidas em Geral do Rio de Janeiro - SINDBEBI', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
        } else {
          matches.push({ sindicato: 'Sindicato das Indústrias de Alimentos do Município do Rio de Janeiro - SIARJ', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
        }
      } else if (munNorm === 'PETROPOLIS' || munNorm === 'TERESOPOLIS') {
        matches.push({ sindicato: 'Sind das Inds de Cerv e Beb em Geral, Prod Cacau, Balas, Doces, Conserv Aliment e Biscot de Petrópolis - SINDCER', regra: `Abrangência Regional (${municipio})`, situacao: 'Enquadrado' });
      } else if (REGIOES_RJ.BAIXADA.includes(munNorm)) {
        matches.push({ sindicato: 'Sind. Inds. de Massas Alimentícias, Panificação e Afins da Baixada Fluminense - SIMAPAN', regra: `Abrangência Regional (${municipio} - Baixada Fluminense)`, situacao: 'Enquadrado' });
      } else if (REGIOES_RJ.LESTE_LAGOS.includes(munNorm)) {
        matches.push({ sindicato: 'Sindicato das Indústrias de Alimentação de Niterói - SIAN', regra: `Abrangência Regional (${municipio} - Leste/Lagos)`, situacao: 'Enquadrado' });
      } else if (REGIOES_RJ.SERRANA.includes(munNorm)) {
        matches.push({ sindicato: 'Sindicato das Indústrias de Alimentação de Nova Friburgo - SINDANF', regra: `Abrangência Regional (${municipio} - Região Serrana)`, situacao: 'Enquadrado' });
      } else if (REGIOES_RJ.NORTE.includes(munNorm)) {
        matches.push({ sindicato: 'Sind Ind Panif Conf Prod Cacau Balas Massas Alim Bisc Cerv Beb Geral Doces e Conservas de Campos - SIPAL', regra: `Abrangência Regional (${municipio} - Norte Fluminense)`, situacao: 'Enquadrado' });
      } else if (REGIOES_RJ.NOROESTE.includes(munNorm)) {
        matches.push({ sindicato: 'Sindicato das Indústrias de Alimentação no Noroeste do Estado do Rio de Janeiro - SIANERJ', regra: `Abrangência Regional (${municipio} - Noroeste Fluminense)`, situacao: 'Enquadrado' });
      } else if (REGIOES_RJ.CENTRO_SUL.includes(munNorm)) {
        matches.push({ sindicato: 'Sind Ind de Alimentação Três Rios, Paraib. do Sul, Sapucaia, Areal, Com.Levy Gaspa e S J V do R.Preto - SINDAL', regra: `Abrangência Regional (${municipio} - Centro-Sul)`, situacao: 'Enquadrado' });
      } else if (REGIOES_RJ.SUL_MEDIO_PARAIBA.includes(munNorm)) {
        matches.push({ sindicato: 'Sindicato das Indústrias de Panificação e Confeitaria da Região Sul do Estado do Rio de Janeiro - SIPACON', regra: `Abrangência Regional (${municipio} - Sul Fluminense)`, situacao: 'Enquadrado' });
      }
    }
  }

  if ((cnae.startsWith('41') || cnae.startsWith('4292') || cnae.startsWith('4299') || cnae.startsWith('433') || cnae.startsWith('439') || cnae.startsWith('711') || cnae.startsWith('9102')) && cnae !== '4291000') {
    if (munNorm === 'RIODEJANEIRO') {
      matches.push({ sindicato: 'Sindicato da Indústria da Construção Civil no Estado do Rio de Janeiro - SINDUSCON RIO', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
    } else if (munNorm === 'PETROPOLIS') {
      matches.push({ sindicato: 'Sindicato da Indústria da Construção Civil de Petrópolis - SINDUSCON PETROPOLIS', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
    } else if (munNorm === 'NITEROI') {
      matches.push({ sindicato: 'Sindicato das Indústrias da Construção Civil e Engenharia Consultiva de Niterói - SINDICON', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.BAIXADA.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato das Indústrias da Construção e Mobiliário de Duque de Caxias - SINCOCIMO', regra: `Abrangência Regional (${municipio} - Baixada Fluminense)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.LESTE_LAGOS.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato das Indústrias da Construção, Engenharia Consultiva e do Mobiliário de Niterói a Cabo Frio - SINDICEM', regra: `Abrangência Regional (${municipio} - Leste Fluminense/Lagos)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.SERRANA.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato da Indústria da Construção Civil do Centro Norte Fluminense - SINDUSCON CN', regra: `Abrangência Regional (${municipio} - Centro-Norte/Serrana)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.NORTE.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato da Indústria da Construção Civil do Norte Fluminense - SINDUSCON NORTE', regra: `Abrangência Regional (${municipio} - Norte Fluminense)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.NOROESTE.includes(munNorm)) {
      matches.push({ sindicato: 'Sind das Inds da Constr Civil, Montagens Industriais e Engª Consultiva no Noroeste do Est do RJ - SINDUSCON NOROESTE', regra: `Abrangência Regional (${municipio} - Noroeste Fluminense)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.CENTRO_SUL.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato das Indústrias da Construção Civil e do Mobiliário de Três Rios, P.Sul, Areal, Com.Levy Gasparian e Sapucaia - SINDICOM TR', regra: `Abrangência Regional (${municipio} - Centro-Sul)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.SUL_MEDIO_PARAIBA.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato das Indústrias da Construção e do Mobiliário de Volta Redonda - SINDUSCON SUL', regra: `Abrangência Regional (${municipio} - Sul Fluminense)`, situacao: 'Enquadrado' });
    }
  }

  const jaEnquadradoNacionalMetal = matches.some(m => ['Sindicato Nacional das Indústrias de Materiais de Defesa - SIMDE', 'Sindicato Nacional da Indústria de Aço - SIND.AÇO', 'Sind. Nacional da Ind. da Construção Naval - SINAVAL'].includes(m.sindicato));
  if (!jaEnquadradoNacionalMetal && (cnae.startsWith('24') || cnae.startsWith('25') || cnae.startsWith('27') || cnae.startsWith('28') || cnae.startsWith('3102') || cnae.startsWith('33') || cnae.startsWith('3831'))) {
    if (munNorm === 'RIODEJANEIRO') {
      if (cnae.startsWith('24') || cnae.startsWith('25')) {
        matches.push({ sindicato: 'Sindicato das Indústrias Metalúrgicas do Município do Rio de Janeiro - SINMETAL', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
      }
      if (cnae.startsWith('27') || cnae.startsWith('28') || cnae.startsWith('30') || cnae.startsWith('3102') || cnae.startsWith('33') || cnae.startsWith('3831')) {
        matches.push({ sindicato: 'Sindicato das Indústrias Mecânicas e de Material Elétrico do Município do Rio de Janeiro - SIMME', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
      }
    } else if (['DUQUEDECAXIAS', 'SAOJOAODEMERITI', 'NILOPOLIS'].includes(munNorm)) {
      matches.push({ sindicato: 'Sind Ind Metalúrgicas, Mecânicas e de Mat Elétrico dos Mun de D de Caxias, S J de Meriti e Nilópolis - SIMMEC', regra: `Abrangência Regional (${municipio} - Baixada Fluminense)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.SUL_MEDIO_PARAIBA.includes(munNorm)) {
      matches.push({ sindicato: 'Sind. Inds. Metal, Mec, Automot, de Info e de Mat. Eletro-Eletrônico Médio Paraíba e Sul Fluminense - METALSUL', regra: `Abrangência Regional (${municipio} - Sul Fluminense)`, situacao: 'Enquadrado' });
    } else if (munNorm === 'NOVAFRIBURGO') {
      matches.push({ sindicato: 'Sindicato das Indústrias Metalúrgicas, Mecânicas e de Material Elétrico de Nova Friburgo - SINDMETAL', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
    } else if (munNorm === 'PETROPOLIS') {
      matches.push({ sindicato: 'Sindicato das Indústrias Metalúrgicas, Mecânicas e de Material Elétrico de Petrópolis - SINDMMEP', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.NORTE.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato das Indústrias Metalúrgicas, Mecânicas e de Material Elétrico de Campos - SINDMEC', regra: `Abrangência Regional (${municipio} - Norte Fluminense)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.NOROESTE.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato das Indústrias Metalúrgicas, Mecânicas e de Mat Elétrico no Noroeste do Est do Rio de Janeiro - SINDMETAL NOROESTE', regra: `Abrangência Regional (${municipio} - Noroeste Fluminense)`, situacao: 'Enquadrado' });
    } else {
      matches.push({ sindicato: 'Sindicato das Indústrias Metalúrgicas, Mecânicas e de Material Elétrico no Estado do Rio de Janeiro - RJ METAL', regra: 'Abrangência Estadual (RJ)', situacao: 'Enquadrado' });
    }
  }

  if (cnae.startsWith('16') || cnae.startsWith('3101') || cnae.startsWith('3103') || cnae.startsWith('3104') || cnae.startsWith('32914') || cnae.startsWith('33295')) {
    if (munNorm === 'RIODEJANEIRO') {
      matches.push({ sindicato: 'Sind Ind Móv Mad Junco Vime Serrar Carpint Tanoaria Mad Compens e Lamin Aglom Chapa do Mun RJ - SIM-RIO', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
    } else if (munNorm === 'PETROPOLIS') {
      matches.push({ sindicato: 'Sindicato da Indústria de Marcenaria, Móveis de Madeira, Serrarias, Carpintarias e Tanoarias de Petrópolis - SINDMARCENARIA', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.NORTE.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato da Indústria do Mobiliário de Campos dos Goytacazes - SINDIMOB', regra: `Abrangência Regional (${municipio} - Norte Fluminense)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.BAIXADA.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato das Indústrias da Construção e Mobiliário de Duque de Caxias - SINCOCIMO', regra: `Abrangência Regional (${municipio} - Baixada Fluminense)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.LESTE_LAGOS.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato das Indústrias da Construção, Engenharia Consultiva e do Mobiliário de Niterói a Cabo Frio - SINDICEM', regra: `Abrangência Regional (${municipio} - Leste Fluminense/Lagos)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.CENTRO_SUL.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato das Indústrias da Construção Civil e do Mobiliário de Três Rios, P.Sul, Areal, Com.Levy Gasparian e Sapucaia - SINDICOM TR', regra: `Abrangência Regional (${municipio} - Centro-Sul)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.SUL_MEDIO_PARAIBA.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato das Indústrias da Construção e do Mobiliário de Volta Redonda - SINDUSCON SUL', regra: `Abrangência Regional (${municipio} - Sul Fluminense)`, situacao: 'Enquadrado' });
    }
  }

  if (cnae.startsWith('14') || cnae.startsWith('15') || cnae.startsWith('13405') || cnae.startsWith('32922') || cnae.startsWith('3299005') || cnae.startsWith('96017')) {
    if (cnae.startsWith('14') && REGIOES_RJ.SUL_MEDIO_PARAIBA.includes(munNorm)) {
      matches.push({
        sindicato: 'Consultar Especialista',
        regra: 'Polo de Vestuário do Sul Fluminense - Encaminhar para associe-se@firjan.com.br o cartão do CNPJ e print da tela do simulador',
        situacao: 'Consultar Especialista'
      });
    } else if (munNorm === 'RIODEJANEIRO') {
      if (cnae.startsWith('15')) {
        matches.push({ sindicato: 'Sindicato das Indústrias de Calçados e de Bolsas, Luvas e Similares do Município do Rio de Janeiro - SINDICALÇADOS', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
      } else if (cnae.startsWith('13405') || cnae.startsWith('96017')) {
        matches.push({ sindicato: 'Sindicato da Indústria da Tinturaria do Vestuário no Município do Rio de Janeiro - SINTINTURARIAS', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
      } else {
        matches.push({ sindicato: 'Sindicato das Indústrias de Vestuário do Rio de Janeiro e Grande Rio - MODA RIO', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
      }
    } else if (munNorm === 'PETROPOLIS') {
      matches.push({ sindicato: 'Sind da Indústria de Confecção de Roupas e Chapéus de Senhoras de Petrópolis - SINDCON', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
    } else if (munNorm === 'NITEROI') {
      matches.push({ sindicato: 'Sindicato da Indústria de Alfaiataria e de Confecção de Roupas de Homem de Niterói - SINDICONF', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
    } else if (munNorm === 'NOVAFRIBURGO') {
      matches.push({ sindicato: 'Sindicato das Indústrias do Vestuário de Nova Friburgo - SINDVEST', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.NORTE.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato da Indústria do Vestuário do Norte Fluminense - SINDVEST NORTE', regra: `Abrangência Regional (${municipio} - Norte Fluminense)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.NOROESTE.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato das Indústrias de Confecções de Roupas no Noroeste do Estado do Rio de Janeiro - SINCRONERJ', regra: `Abrangência Regional (${municipio} - Noroeste Fluminense)`, situacao: 'Enquadrado' });
    } else {
      matches.push({ sindicato: 'Sindicato das Indústrias de Vestuário do Rio de Janeiro e Grande Rio - MODA RIO', regra: `Abrangência Regional (${municipio})`, situacao: 'Enquadrado' });
    }
  }

  if (cnae.startsWith('181') || cnae.startsWith('182') || cnae.startsWith('581') || cnae.startsWith('582')) {
    if (munNorm === 'RIODEJANEIRO') {
      matches.push({ sindicato: 'Sindicato das Indústrias Gráficas do Município do Rio de Janeiro - SIGRAF', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
    } else if (munNorm === 'PETROPOLIS') {
      matches.push({ sindicato: 'Sindicato das Indústrias Gráficas de Petrópolis - SIGRAP', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
    } else if (munNorm === 'NOVAFRIBURGO') {
      matches.push({ sindicato: 'Sindicato das Indústrias Gráficas de Nova Friburgo - SINDGRAF', regra: `Abrangência Municipal (${municipio})`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.NORTE.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato das Indústrias Gráficas de Campos - SINDGRAF CAMPOS', regra: `Abrangência Regional (${municipio} - Norte Fluminense)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.NOROESTE.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato das Indústrias Gráficas no Noroeste do Estado do Rio de Janeiro - SINDGRAF NOROESTE', regra: `Abrangência Regional (${municipio} - Noroeste Fluminense)`, situacao: 'Enquadrado' });
    } else if (REGIOES_RJ.SUL_MEDIO_PARAIBA.includes(munNorm)) {
      matches.push({ sindicato: 'Sindicato das Indústrias Gráficas do Sul Fluminense - SINGRASUL', regra: `Abrangência Regional (${municipio} - Sul Fluminense)`, situacao: 'Enquadrado' });
    } else {
      matches.push({ sindicato: 'Sindicato das Indústrias Gráficas do Estado do Rio de Janeiro - SIGRARJ', regra: 'Abrangência Estadual (RJ)', situacao: 'Enquadrado' });
    }
  }

  return matches;
}

export function enquadrarPrincipal(
  cnaeCode: string,
  cnaeDesc: string,
  municipio: string,
  uf: string
): EnquadramentoPrincipal {
  const cnae = cleanNumber(cnaeCode);
  const ufNorm = cleanText(uf);
  const cnaeInfo = baseCNAEs[cnae];

  if (CNAES_FORA.has(cnae) || (cnaeInfo && cnaeInfo.assoc === 'Fora do Perfil')) {
    return {
      sindicato: 'Fora do Perfil Associativo',
      regra: 'Atividade comercial/serviço sem representação sindical industrial no Sistema FIRJAN',
      situacao: 'Fora do Perfil',
      confianca: '100% (Regra Oficial)',
      badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200'
    };
  }

  const sindicatos = buscarSindicatosParaCnae(cnae, municipio, uf);

  if (sindicatos.length > 0) {
    const primeiro = sindicatos[0];
    if (primeiro.situacao === 'Consultar Especialista') {
      return {
        sindicato: 'Consultar Especialista',
        regra: primeiro.regra,
        situacao: 'Consultar Especialista',
        confianca: 'Regra Territorial Específica',
        badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200'
      };
    }
    return {
      sindicato: sindicatos.map(s => s.sindicato).join(' / '),
      regra: primeiro.regra,
      situacao: 'Enquadrado',
      confianca: '100% (Base Oficial FIRJAN)',
      badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200'
    };
  }

  if (cnaeInfo && cnaeInfo.assoc === 'Consultar Especialista') {
    return {
      sindicato: 'Consultar Especialista',
      regra:
        ufNorm === 'RJ'
          ? 'Atividade com perfil comercial/serviço ou mista - requer análise da operação real junto ao Especialista FIRJAN (associe-se@firjan.com.br)'
          : `Atividade localizada fora do Estado do RJ (${ufNorm}) sem abrangência nacional direta`,
      situacao: 'Consultar Especialista',
      confianca: 'Análise Individual',
      badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200'
    };
  }

  return {
    sindicato: 'Consultar Especialista',
    regra:
      ufNorm === 'RJ'
        ? 'Atividade industrial sem sindicato de abrangência específica no município - requer análise'
        : `Atividade localizada fora do Estado do RJ (${ufNorm}) sem abrangência nacional direta`,
    situacao: 'Consultar Especialista',
    confianca: 'Avaliação Territorial',
    badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200'
  };
}

export function analisarSecundarios(
  cnaesSecundarios: Array<{ codigo?: string; code?: string; descricao?: string; desc?: string }>,
  municipio: string,
  uf: string
): CnaeAnaliseSecundario[] {
  if (!cnaesSecundarios || !Array.isArray(cnaesSecundarios) || cnaesSecundarios.length === 0) {
    return [];
  }

  const resultados: CnaeAnaliseSecundario[] = [];

  cnaesSecundarios.forEach(sec => {
    const cnaeSecCode = String(sec.codigo || sec.code || '').padStart(7, '0');
    const cnaeClean = cleanNumber(cnaeSecCode);
    const cnaeInfo = baseCNAEs[cnaeClean];
    const cnaeSecDesc =
      cnaeInfo && cnaeInfo.desc ? cnaeInfo.desc : sec.descricao || sec.desc || 'Sem descrição informada';

    if (CNAES_FORA.has(cnaeClean) || (cnaeInfo && cnaeInfo.assoc === 'Fora do Perfil')) {
      resultados.push({
        cnae: cnaeSecCode,
        desc: cnaeSecDesc,
        sindicato: 'Fora do Perfil Associativo',
        regra: 'Atividade comercial/serviço sem representação industrial',
        situacao: 'Fora do Perfil',
        badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200'
      });
      return;
    }

    const sindicatos = buscarSindicatosParaCnae(cnaeClean, municipio, uf);

    if (sindicatos.length > 0) {
      sindicatos.forEach(s => {
        resultados.push({
          cnae: cnaeSecCode,
          desc: cnaeSecDesc,
          sindicato: s.sindicato,
          regra: s.regra,
          situacao: s.situacao,
          badgeClass:
            s.situacao === 'Enquadrado'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
        });
      });
    } else {
      const isEspec = cnaeInfo.assoc === 'Consultar Especialista';
      resultados.push({
        cnae: cnaeSecCode,
        desc: cnaeSecDesc,
        sindicato: isEspec ? 'Consultar Especialista' : '—',
        regra: 'Atividade de apoio ou comercial/serviço complementar',
        situacao: isEspec ? 'Consultar Especialista' : 'Outros',
        badgeClass: isEspec
          ? 'bg-amber-50 text-amber-800 border border-amber-200'
          : 'bg-slate-100 text-slate-600 border border-slate-200'
      });
    }
  });

  return resultados;
}
