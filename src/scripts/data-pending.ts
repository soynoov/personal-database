export function initDataPendingFilters() {
  const root = document.querySelector<HTMLElement>('[data-pending-root]');
  const search = document.querySelector<HTMLInputElement>('[data-pending-search]');
  const category = document.querySelector<HTMLSelectElement>('[data-pending-category]');
  const resultCount = document.querySelector<HTMLElement>('[data-pending-count]');
  if (!root || !search || !category || !resultCount) return;

  const cards = [...root.querySelectorAll<HTMLElement>('[data-pending-card]')];
  const normalize = (value: string) => value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const apply = () => {
    const query = normalize(search.value.trim());
    const selectedCategory = category.value;
    let visible = 0;

    cards.forEach((card) => {
      const matchesSearch = !query || normalize(card.dataset.title ?? '').includes(query);
      const categories = (card.dataset.categories ?? '').split(' ');
      const matchesCategory = !selectedCategory || categories.includes(selectedCategory);
      const show = matchesSearch && matchesCategory;
      card.hidden = !show;
      if (show) visible += 1;
    });

    resultCount.textContent = `${visible} ${visible === 1 ? 'juego' : 'juegos'}`;
    root.dataset.empty = visible === 0 ? 'true' : 'false';
  };

  search.addEventListener('input', apply);
  category.addEventListener('change', apply);
  apply();
}
