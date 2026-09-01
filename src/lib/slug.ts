// filepath: src/lib/slug.ts
export function generateSlug(clientName: string, projectTitle: string): string {
  return (
    `${clientName}-${projectTitle}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "propuesta"
  );
}
