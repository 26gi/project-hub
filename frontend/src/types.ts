export type Case = {
  id: number;
  title: string;
  client_id: number;
  assignee_id: number;
  status_id: number;
  order_amount: number | null;
  progress_phase_id: number | null;
  due_date: string | null;
  phase_due_date: string | null; // ← 追加
  description: string | null;
  created_at: string;
  updated_at: string;
  client_name: string | null;
  assignee_name: string | null;
  status_name: string | null;
  status_color: string | null;
  phase_name: string | null;
};

export type CaseForm = {
  title: string;
  client_id: number;
  assignee_id: number;
  status_id: number;
  order_amount: number | null;
  progress_phase_id: number | null;
  due_date: string | null;
  description: string | null;
  phase_due_date: string | null;
};

export type Status = { id: number; name: string; theme_color: string };
export type Client = { id: number; name: string };
export type User = {
  id: number;
  username: string;
  display_name: string;
  email: string;
};
export type Phase = { id: number; name: string };
export type Toast = { id: number; message: string; type: "success" | "error" };

export type CaseFile = {
  id: number;
  case_id: number;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  phase_due_date: string | null;
};
