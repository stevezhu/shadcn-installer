export function parseRegistryItem(name: string) {
  if (name.startsWith('@')) {
    const parts = name.split('/');
    if (parts.length > 1) {
      return {
        item: parts.slice(1).join('/'),
        registry: parts[0],
      };
    }
  }

  return {
    item: name,
    registry: null,
  };
}
