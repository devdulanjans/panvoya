export function wildcardMatch(value, query) {
  const pattern = query.trim().replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp(pattern, 'i').test(value);
}
