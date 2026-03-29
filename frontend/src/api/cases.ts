const BASE = "http://localhost:8000";

import type {
  Case,
  CaseForm,
  Status,
  Client,
  User,
  Phase,
  CaseFile,
} from "../types";
export type {
  Case,
  CaseForm,
  Status,
  Client,
  User,
  Phase,
  CaseFile,
} from "../types";

const FILE_ICON: Record<string, string> = {
  "application/pdf": "📄",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "📊",
  "application/vnd.ms-excel": "📊",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "📝",
  "application/msword": "📝",
  "image/png": "🖼",
  "image/jpeg": "🖼",
};

export const getFileIcon = (mimeType: string): string =>
  FILE_ICON[mimeType] ?? "📎";

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
};

export const api = {
  cases: {
    list: (q?: string, status_id?: string) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status_id) params.set("status_id", status_id);
      return fetch(`${BASE}/cases/?${params}`).then((r) => r.json()) as Promise<
        Case[]
      >;
    },
    create: (body: CaseForm) =>
      fetch(`${BASE}/cases/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json()) as Promise<Case>,
    update: (id: number, body: CaseForm) =>
      fetch(`${BASE}/cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json()) as Promise<Case>,
    delete: (id: number) => fetch(`${BASE}/cases/${id}`, { method: "DELETE" }),
  },
  statuses: {
    list: () =>
      fetch(`${BASE}/statuses/`).then((r) => r.json()) as Promise<Status[]>,
  },
  clients: {
    list: () =>
      fetch(`${BASE}/clients/`).then((r) => r.json()) as Promise<Client[]>,
    create: (name: string) =>
      fetch(`${BASE}/clients/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }).then((r) => r.json()) as Promise<Client>,
  },
  users: {
    list: () =>
      fetch(`${BASE}/users/`).then((r) => r.json()) as Promise<User[]>,
  },
  phases: {
    list: () =>
      fetch(`${BASE}/phases/`).then((r) => r.json()) as Promise<Phase[]>,
  },
  files: {
    list: (caseId: number) =>
      fetch(`${BASE}/cases/${caseId}/files/`).then((r) => r.json()) as Promise<
        CaseFile[]
      >,
    upload: (caseId: number, file: File) => {
      const form = new FormData();
      form.append("file", file);
      return fetch(`${BASE}/cases/${caseId}/files/`, {
        method: "POST",
        body: form,
      }).then((r) => r.json()) as Promise<CaseFile>;
    },
    delete: (caseId: number, fileId: number) =>
      fetch(`${BASE}/cases/${caseId}/files/${fileId}`, { method: "DELETE" }),
    downloadUrl: (caseId: number, fileId: number): string =>
      `${BASE}/cases/${caseId}/files/${fileId}/download`,
  },
};
