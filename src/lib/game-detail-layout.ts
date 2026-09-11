export type DetailState = 'default' | 'empty' | 'complete' | 'not-applicable';
export type ProgressKind = 'difficulty' | 'achievements' | 'cards';
export type DetailItem = {
  label: string;
  value: string;
  values?: string[];
  className?: string;
  note?: string;
  progress?: number | null;
  kind?: ProgressKind;
  state?: DetailState;
  action?: 'steam-appid';
};

export type DetailGroup = {
  title: string;
  className?: string;
  items: DetailItem[];
};

/** Coverage describes the layout, not whether a game qualifies as Golden. */
export function getDetailGroupLayout(items: DetailItem[]) {
  const visibleItems = items.filter((item) => item.state !== 'not-applicable');
  const populated = visibleItems.filter((item) => item.state !== 'empty').length;
  const state = visibleItems.length === 0
    ? 'not-applicable'
    : populated === 0 ? 'empty' : populated === visibleItems.length ? 'complete' : 'partial';
  return { visibleItems, state };
}
