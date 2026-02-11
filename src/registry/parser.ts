export function parseRegistryItem(name: string): { registry: string; item: string } {
  if (name.includes("/")) {
    const [registry, ...rest] = name.split("/")
    return { registry, item: rest.join("/") }
  }
  return { registry: "default", item: name }
}

export function isRegistryItem(name: string): boolean {
  // Simple check for now
  return typeof name === "string" && name.length > 0
}
