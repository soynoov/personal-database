import type { ReviewCriterionKey } from './review-criteria';

export type LegacyCritique = {
  metascore?: number | null;
  userscore?: number | null;
  criterios?: Partial<Record<ReviewCriterionKey | 'originalidad', number | null>> | null;
  mencion_honorifica?: { nivel?: number | null; comentario?: string | null } | null;
};

export type GameCritique = LegacyCritique & {
  version?: 2;
  original?: boolean | null;
  no_aplica?: ReviewCriterionKey[];
  ultima_completa?: { nota: number; criterios: LegacyCritique['criterios']; no_aplica: ReviewCriterionKey[]; original: boolean | null };
  migracion?: {
    version_origen: 1;
    nota_anterior: number | null;
    nota_guardada: number | null;
    critica_anterior: LegacyCritique | null;
  };
};
