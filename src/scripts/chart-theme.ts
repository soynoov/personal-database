/** Resolve the same CSS tokens used by the DOM for canvas-based charts. */
export function readCssColors(element: HTMLElement, tokens: string[]): string[] {
  const probe = document.createElement('span');
  probe.hidden = true;
  element.parentElement?.appendChild(probe);
  const color = (token: string) => {
    probe.style.color = `var(${token})`;
    return getComputedStyle(probe).color;
  };
  const colors = tokens.map(color);
  probe.remove();
  return colors;
}

export function readChartTheme(element: HTMLElement) {
  const [primary, secondary, tertiary, text, muted, panel, line, fill, fillEnd] = readCssColors(element, [
    '--chart-primary', '--chart-secondary', '--chart-tertiary', '--text', '--muted',
    '--panel-bg', '--panel-line', '--chart-fill', '--chart-fill-end',
  ]);
  return { primary, secondary, tertiary, text, muted, panel, line, fill, fillEnd,
    font: getComputedStyle(element).getPropertyValue('--font-body').trim() };
}
