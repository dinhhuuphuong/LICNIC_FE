export function formatYmdToDmy(value: string | null | undefined): string {
  if (!value) return '';

  const ymdMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    const [, yyyy, mm, dd] = ymdMatch;
    return `${dd}/${mm}/${yyyy}`;
  }

  const dt = new Date(value);
  if (!Number.isNaN(dt.getTime())) {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dt);
  }

  return value;
}
