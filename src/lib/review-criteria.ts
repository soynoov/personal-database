/** Las escalas describen respuestas; los pesos, no su longitud, determinan la nota. */
export const REVIEW_VERSION = 2 as const;
export type ReviewCriterionKey = 'jugabilidad' | 'graficos_arte' | 'musica' | 'historia'
  | 'rendimiento' | 'progresion' | 'comunidad' | 'entretenimiento';

export type ReviewCriterionDefinition = {
  key: ReviewCriterionKey;
  label: string;
  shortLabel: string;
  min: number;
  max: number;
  weight: number;
  step: number;
  optional: boolean;
  question: string;
  measures: string;
  scale: Record<number, string>;
};

export const REVIEW_STEPS = ['Jugar', 'Mundo', 'Experiencia', 'Balance'] as const;

export const REVIEW_CRITERIA: ReviewCriterionDefinition[] = [
  {
    key: 'jugabilidad', label: 'Jugabilidad y sistemas', shortLabel: 'Jugabilidad',
    min: 0, max: 5, weight: 20, step: 0, optional: false,
    question: '¿Qué tal se juega y cómo funcionan sus mecánicas?',
    measures: 'Controles, reglas y sistemas. Valora cuánto afectan sus fallos, no cuántos hay. Aquí juzgas cómo está construido; en Diversión, cómo te lo pasaste.',
    scale: {
      0: 'Las mecánicas centrales no funcionan: jugar resulta inviable.',
      1: 'Controles o sistemas deficientes entorpecen casi toda la experiencia.',
      2: 'Se puede jugar, pero varios problemas importantes lastran sus mecánicas.',
      3: 'Funciona bien y es entretenido, con limitaciones o fricciones claras.',
      4: 'Mecánicas muy bien resueltas; solo encuentro fallos menores.',
      5: 'Prácticamente redondo: controles, reglas y sistemas encajan sin carencias relevantes.',
    },
  },
  {
    key: 'progresion', label: 'Progresión y ritmo', shortLabel: 'Progresión',
    min: 0, max: 5, weight: 15, step: 0, optional: true,
    question: '¿Sientes que avanzas, aprendes y que tu esfuerzo merece la pena?',
    measures: 'Aprendizaje, ritmo, recompensas y crecimiento. En competitivo valora la coherencia del sistema, no que tu rango suba siempre. No aplica solo si el juego no plantea progresión ni aprendizaje evaluables.',
    scale: {
      0: 'El progreso está roto o bloqueado injustificadamente.',
      1: 'Estancamiento, repetición o castigos desproporcionados dominan la experiencia.',
      2: 'Hay avances, pero el ritmo o las recompensas frustran con frecuencia.',
      3: 'Siento progreso, aunque hay tramos lentos o desequilibrios claros.',
      4: 'Avanzo y mejoro de forma satisfactoria, con pocos altibajos.',
      5: 'Aprendizaje, ritmo y recompensas están prácticamente redondos.',
    },
  },
  {
    key: 'graficos_arte', label: 'Gráficos / dirección artística', shortLabel: 'Arte',
    min: 0, max: 5, weight: 10, step: 1, optional: false,
    question: '¿Cómo de atractivo y coherente es visualmente?',
    measures: 'Diseño visual, ambientes, personajes y coherencia del estilo. Un juego sencillo o pixel art puede obtener el máximo: no se exige realismo.',
    scale: {
      0: 'Su presentación visual perjudica seriamente la experiencia.',
      1: 'Poco atractivo y con incoherencias visuales constantes.',
      2: 'Algunos aciertos, pero su aspecto general me parece flojo.',
      3: 'Visualmente agradable y coherente, sin destacar especialmente.',
      4: 'Muy atractivo, con una dirección artística sólida y detalles memorables.',
      5: 'Prácticamente impecable dentro de su estilo; no encuentro carencias relevantes.',
    },
  },
  {
    key: 'historia', label: 'Historia / inmersión', shortLabel: 'Inmersión',
    min: 0, max: 5, weight: 15, step: 1, optional: true,
    question: '¿Te atrapa su mundo y tiene coherencia lo que cuenta?',
    measures: 'Historia, lore, personajes y capacidad de sumergirte en su mundo. No necesita cinemáticas. Si no propone un relato ni un mundo narrativo que valorar, marca No aplica.',
    scale: {
      0: 'El relato o el mundo no se sostienen y rompen la inmersión.',
      1: 'Inconsistencias o una narración muy débil impiden implicarme.',
      2: 'Tiene ideas interesantes, pero me cuesta conectar con su mundo.',
      3: 'Su mundo es coherente y me interesa, con limitaciones claras.',
      4: 'Me atrapa, está bien construido y deja momentos memorables.',
      5: 'Relato e inmersión prácticamente redondos, sin carencias relevantes.',
    },
  },
  {
    key: 'musica', label: 'Música', shortLabel: 'Música',
    min: 0, max: 3, weight: 5, step: 2, optional: true,
    question: '¿Qué huella te ha dejado su música?',
    measures: 'Tu recuerdo e identificación con la banda sonora, no toda la calidad del sonido. No aplica si no tiene música; si la tiene pero no la recuerdas, es 0.',
    scale: {
      0: 'No recuerdo ninguna canción.',
      1: 'Sé qué música era, pero no tuvo importancia para mí.',
      2: 'La música tiene un peso importante en la experiencia.',
      3: 'La escucharía fuera del juego y sabría de qué juego es.',
    },
  },
  {
    key: 'rendimiento', label: 'Rendimiento / estabilidad', shortLabel: 'Rendimiento',
    min: 0, max: 3, weight: 10, step: 2, optional: false,
    question: '¿Funcionó con fluidez y sin problemas técnicos?',
    measures: 'Rendimiento, bugs y estabilidad durante tus partidas y en tu equipo. No juzgues problemas de versiones que no has jugado.',
    scale: {
      0: 'Injugable por los problemas técnicos.',
      1: 'Se puede jugar, pero los problemas molestan de forma importante.',
      2: 'Algún problema puntual, sin dominar la experiencia.',
      3: 'No he tenido problemas técnicos apreciables.',
    },
  },
  {
    key: 'comunidad', label: 'Comunidad', shortLabel: 'Comunidad',
    min: 0, max: 5, weight: 5, step: 3, optional: true,
    question: '¿Cómo te han tratado al jugar con la comunidad pública?',
    measures: 'Convivencia, toxicidad, trampas y moderación que has experimentado. Solo multijugador público o competitivo; el cooperativo privado con amigos no lo sustituye.',
    scale: {
      0: 'Insultos, trampas o acoso constantes y sin una respuesta efectiva.',
      1: 'Muy tóxica: las malas conductas son habituales y condicionan jugar.',
      2: 'Desagradable con frecuencia, con moderación insuficiente.',
      3: 'Mixta: alterna buenas experiencias con conflictos claros.',
      4: 'Mayormente respetuosa; los problemas son puntuales.',
      5: 'Muy sana y acogedora, con juego limpio y moderación efectiva.',
    },
  },
  {
    key: 'entretenimiento', label: 'Diversión', shortLabel: 'Diversión',
    min: 0, max: 5, weight: 20, step: 3, optional: false,
    question: 'En conjunto, ¿cómo te lo has pasado?',
    measures: 'Tu disfrute personal, aunque reconozcas defectos. Sustituye a la mención honorífica: no añade un segundo bonus.',
    scale: {
      0: 'No me lo pasé bien.',
      1: 'Predominan el aburrimiento o la frustración; pocos buenos momentos.',
      2: 'Me entretuvo a ratos, sin disfrutarlo de forma consistente.',
      3: 'Me lo pasé bien durante buena parte de la experiencia.',
      4: 'Lo disfruté mucho y de forma consistente.',
      5: 'Lo disfruté como un enano; prácticamente redondo en diversión.',
    },
  },
];

export const OVERALL_SCORE_SCALE = [
  'Injugable o sin cualidades rescatables para mí.',
  'Pésimo: los problemas dominan casi toda la experiencia.',
  'Muy malo: aciertos aislados, carencias graves.',
  'Malo: demasiados problemas para recomendarlo.',
  'Insuficiente: tiene virtudes, pero pesan más sus carencias.',
  'Aceptable: cumple lo mínimo, con limitaciones importantes.',
  'Correcto: funciona y se disfruta, sin destacar demasiado.',
  'Bueno: recomendable, aunque con aspectos claros que mejorar.',
  'Muy bueno: destaca y sus defectos no dominan la experiencia.',
  'Excelente: sobresaliente, pero aún mejorable.',
  'Prácticamente perfecto en lo que propone, sin carencias relevantes.',
] as const;
