export function parseRegistryItem(name: string) {
  if (name.startsWith("@")) {
    const parts = name.split("/")
    if (parts.length > 1) {
      return {
        registry: parts[0],
        item: parts.slice(1).join("/"),
      }
    }
  }

  return {
    registry: null,
    item: name,
  }
}
