import { getGamePill, type GamePillKind } from '../lib/game-pill';

export function updateGamePill(element: HTMLElement, kind: GamePillKind, value: unknown, label?: string) {
  const pill = getGamePill(kind, value, label);
  element.className = pill.className;
  element.dataset.gamePill = kind;
  // Only escaped labels and the existing local icon allowlist enter this markup.
  element.innerHTML = pill.content;
}

export function createGamePill(kind: GamePillKind, value: unknown, label?: string) {
  const element = document.createElement('span');
  updateGamePill(element, kind, value, label);
  return element;
}
