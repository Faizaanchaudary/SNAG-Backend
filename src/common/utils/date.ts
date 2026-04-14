export const formatDate = (date: Date): string =>
  date.toISOString().split('T')[0];

export const isExpired = (date: Date): boolean =>
  date.getTime() < Date.now();
