// filepath: src/lib/stages.ts
export interface ProjectStage {
  id: number;
  name: string;
  status: "pending" | "current" | "done";
  notes?: string;
  updated_at?: string;
}

export const DEFAULT_STAGES: ProjectStage[] = [
  { id: 1, name: "Propuesta y Alcance", status: "done" },
  { id: 2, name: "Kick-off y Contenidos", status: "current" },
  { id: 3, name: "Diseño UI/UX", status: "pending" },
  { id: 4, name: "Desarrollo", status: "pending" },
  { id: 5, name: "Revisiones", status: "pending" },
  { id: 6, name: "Lanzamiento", status: "pending" },
  { id: 7, name: "Soporte post-lanzamiento", status: "pending" },
];
