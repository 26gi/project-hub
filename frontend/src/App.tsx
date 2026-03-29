import { useEffect, useState } from "react";
import { api } from "./api/cases";
import type {
  Case,
  CaseForm,
  Status,
  Client,
  User,
  Phase,
  Toast,
} from "./types";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import CaseModal from "./components/CaseModal";
import CaseDetailModal from "./components/CaseDetailModal";
import ToastContainer from "./components/Toast";
import CaseTable from "./components/CaseTable";

const emptyForm = (): CaseForm => ({
  title: "",
  client_id: 0,
  assignee_id: 0,
  status_id: 0,
  order_amount: null,
  progress_phase_id: null,
  due_date: null,
  phase_due_date: null, // ← 追加
  description: null,
});

export default function App() {
  const [cases, setCases] = useState<Case[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState<number | "">("");
  const [filterAssignee, setFilterAssignee] = useState<number | "">("");
  const [filterClient, setFilterClient] = useState<number | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Case | null>(null);
  const [form, setForm] = useState<CaseForm>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeNav, setActiveNav] = useState("board");
  const [detailCase, setDetailCase] = useState<Case | null>(null);

  useEffect(() => {
    api.statuses.list().then(setStatuses);
    api.clients.list().then(setClients);
    api.users.list().then(setUsers);
    api.phases.list().then(setPhases);
  }, []);

  useEffect(() => {
    load();
  }, [q, filterStatus]);

  const load = () =>
    api.cases
      .list(q || undefined, filterStatus ? String(filterStatus) : undefined)
      .then(setCases);

  const addToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const filtered = cases.filter((c) => {
    if (filterAssignee && c.assignee_id !== filterAssignee) return false;
    if (filterClient && c.client_id !== filterClient) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortOrder) return 0;
    const dA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
    const dB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
    return sortOrder === "asc" ? dA - dB : dB - dA;
  });

  const totalAmount = filtered.reduce((s, c) => s + (c.order_amount ?? 0), 0);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "案件名は必須です";
    if (!form.client_id) e.client_id = "クライアントを選択してください";
    if (!form.assignee_id) e.assignee_id = "担当者を選択してください";
    if (editing && !form.status_id)
      e.status_id = "ステータスを選択してください";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => {
    setEditing(null);
    const defaultStatus = statuses.find((s) => s.name === "未着手");
    setForm({ ...emptyForm(), status_id: defaultStatus?.id ?? 0 });
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (c: Case) => {
    setEditing(c);
    setForm({
      title: c.title,
      client_id: c.client_id,
      assignee_id: c.assignee_id,
      status_id: c.status_id,
      order_amount: c.order_amount,
      progress_phase_id: c.progress_phase_id,
      due_date: c.due_date,
      phase_due_date: c.phase_due_date, // ← 追加
      description: c.description,
    });
    setErrors({});
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editing) {
        await api.cases.update(editing.id, form);
        addToast("案件を更新しました");
      } else {
        await api.cases.create(form);
        addToast("案件を登録しました");
      }
      setShowForm(false);
      load();
    } catch {
      addToast("エラーが発生しました", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("この案件を削除しますか？\nこの操作は取り消せません。"))
      return;
    try {
      await api.cases.delete(id);
      addToast("案件を削除しました");
      setShowForm(false);
      setDetailCase(null);
      load();
    } catch {
      addToast("削除に失敗しました", "error");
    }
  };

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f8fafc",
        overflow: "hidden",
      }}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } * { box-sizing: border-box; }`}</style>

      <Header
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onCreateClick={openCreate}
      />

      <FilterBar
        q={q}
        onQChange={setQ}
        filterStatus={filterStatus}
        filterAssignee={filterAssignee}
        filterClient={filterClient}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        onFilterStatusChange={setFilterStatus}
        onFilterAssigneeChange={setFilterAssignee}
        onFilterClientChange={setFilterClient}
        statuses={statuses}
        users={users}
        clients={clients}
        totalCount={filtered.length}
        totalAmount={totalAmount}
      />

      <CaseTable
        cases={sorted}
        statuses={statuses}
        clients={clients}
        users={users}
        phases={phases}
        onSaved={load}
        onEdit={openEdit}
        onRowClick={setDetailCase}
      />

      {showForm && (
        <CaseModal
          editing={editing}
          form={form}
          errors={errors}
          statuses={statuses}
          clients={clients}
          users={users}
          phases={phases}
          onFormChange={setForm}
          onSubmit={handleSubmit}
          onDelete={() => editing && handleDelete(editing.id)}
          onClose={() => setShowForm(false)}
          onClientAdded={(client) => setClients((prev) => [...prev, client])}
        />
      )}

      {detailCase && (
        <CaseDetailModal
          c={detailCase}
          statuses={statuses}
          clients={clients}
          users={users}
          phases={phases}
          onClose={() => setDetailCase(null)}
          onDelete={() => handleDelete(detailCase.id)}
          onSaved={load}
          onClientAdded={(client) => setClients((prev) => [...prev, client])}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
