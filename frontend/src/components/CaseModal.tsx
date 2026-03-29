import { useState, useRef } from "react";
import type { Case, CaseForm, Status, Client, User, Phase } from "../types";
import { btnStyle, lbl, lbTxt, inp, errTxt } from "../styles";
import ClientSelectModal from "./ClientSelectModal";
import { getFileIcon, formatFileSize } from "../api/cases";

type Props = {
  editing: Case | null;
  form: CaseForm;
  errors: Record<string, string>;
  statuses: Status[];
  clients: Client[];
  users: User[];
  phases: Phase[];
  onFormChange: (form: CaseForm) => void;
  onDelete: () => void;
  onClose: () => void;
  onClientAdded: (client: Client) => void;
  onSubmit: (pendingFiles: File[]) => void;
};

export default function CaseModal({
  editing,
  form,
  errors,
  statuses,
  clients,
  users,
  phases,
  onFormChange,
  onSubmit,
  onDelete,
  onClose,
  onClientAdded,
}: Props) {
  const set = (patch: Partial<CaseForm>) => onFormChange({ ...form, ...patch });
  const [showClientSelect, setShowClientSelect] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]); // ← 追加
  const fileInputRef = useRef<HTMLInputElement>(null); // ← 追加

  // ファイル選択
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPendingFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ファイル削除（未アップロード）
  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 32,
          width: 900,
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 style={{ margin: "0 0 16px", fontSize: 18, color: "#1e293b" }}>
          {editing ? "案件を編集" : "案件を登録"}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 32px",
          }}
        >
          {/* 左カラム */}
          <div>
            <label style={{ ...lbl, marginBottom: 12 }}>
              <span style={lbTxt}>案件名 *</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set({ title: e.target.value })}
                style={{
                  ...inp,
                  borderColor: errors.title ? "#ef4444" : "#d1d5db",
                }}
              />
              {errors.title && <span style={errTxt}>{errors.title}</span>}
            </label>

            <label style={{ ...lbl, marginBottom: 12 }}>
              <span style={lbTxt}>クライアント *</span>
              <div
                onClick={() => setShowClientSelect(true)}
                style={{
                  ...inp,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderColor: errors.client_id ? "#ef4444" : "#d1d5db",
                  color: form.client_id ? "#374151" : "#9ca3af",
                }}
              >
                <span>
                  {clients.find((c) => c.id === form.client_id)?.name ??
                    "選択してください"}
                </span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>▼</span>
              </div>
              {errors.client_id && (
                <span style={errTxt}>{errors.client_id}</span>
              )}
            </label>

            {editing && (
              <label style={{ ...lbl, marginBottom: 12 }}>
                <span style={lbTxt}>ステータス *</span>
                <select
                  value={form.status_id}
                  onChange={(e) => {
                    const s = statuses.find(
                      (s) => s.id === Number(e.target.value),
                    );
                    set({
                      status_id: Number(e.target.value),
                      progress_phase_id:
                        s?.name === "進行中" ? form.progress_phase_id : null,
                    });
                  }}
                  style={{
                    ...inp,
                    borderColor: errors.status_id ? "#ef4444" : "#d1d5db",
                  }}
                >
                  <option value={0}>選択してください</option>
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.status_id && (
                  <span style={errTxt}>{errors.status_id}</span>
                )}
              </label>
            )}

            {editing && (
              <div>
                {(() => {
                  console.log(
                    "editing:",
                    editing?.id,
                    "status_id:",
                    form.status_id,
                    "statuses:",
                    statuses.length,
                  );
                  return null;
                })()}
                {statuses.find((s) => s.id === form.status_id)?.name !==
                  "未着手" && (
                  <label style={{ ...lbl, marginBottom: 12 }}>
                    <span style={lbTxt}>進捗フェーズ</span>
                    <select
                      value={form.progress_phase_id ?? 0}
                      onChange={async (e) => {
                        const newPhaseId = Number(e.target.value) || null;
                        const notStarted = statuses.find(
                          (s) => s.name === "未着手",
                        );
                        if (
                          newPhaseId !== null &&
                          form.status_id === notStarted?.id
                        ) {
                          const progressing = statuses.find(
                            (s) => s.name === "進行中",
                          );
                          const confirmed = confirm(
                            "現在のステータスは「未着手」です。\nフェーズを設定するとステータスを「進行中」に変更します。\nよろしいですか？",
                          );
                          if (confirmed && progressing) {
                            set({
                              progress_phase_id: newPhaseId,
                              status_id: progressing.id,
                            });
                          }
                          return;
                        }
                        set({ progress_phase_id: newPhaseId });
                      }}
                      style={inp}
                    >
                      <option value={0}>未設定</option>
                      {phases.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            )}
            <label style={{ ...lbl, marginBottom: 0 }}>
              <span style={lbTxt}>案件メモ</span>
              <textarea
                value={form.description ?? ""}
                onChange={(e) => set({ description: e.target.value || null })}
                rows={editing ? 4 : 6}
                style={{ ...inp, resize: "vertical" }}
              />
            </label>
          </div>

          {/* 右カラム */}
          <div>
            {/* 担当者・納期・受注金額を1行ずつ */}
            <label style={{ ...lbl, marginBottom: 12 }}>
              <span style={lbTxt}>担当者 *</span>
              <select
                value={form.assignee_id}
                onChange={(e) => set({ assignee_id: Number(e.target.value) })}
                style={{
                  ...inp,
                  borderColor: errors.assignee_id ? "#ef4444" : "#d1d5db",
                }}
              >
                <option value={0}>選択してください</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.display_name}
                  </option>
                ))}
              </select>
              {errors.assignee_id && (
                <span style={errTxt}>{errors.assignee_id}</span>
              )}
            </label>

            <label style={{ ...lbl, marginBottom: 12 }}>
              <span style={lbTxt}>納期</span>
              <input
                type="date"
                value={form.due_date ?? ""}
                onChange={(e) => set({ due_date: e.target.value || null })}
                style={inp}
              />
            </label>

            <label style={{ ...lbl, marginBottom: 12 }}>
              <span style={lbTxt}>受注金額</span>
              <input
                type="number"
                value={form.order_amount ?? ""}
                onChange={(e) =>
                  set({ order_amount: Number(e.target.value) || null })
                }
                style={inp}
              />
            </label>

            {/* 新規登録時のファイル添付 */}
            {!editing && (
              <div style={{ marginBottom: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={lbTxt}>添付ファイル（任意）</span>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                      accept=".pdf,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg"
                      multiple
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        padding: "5px 12px",
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      ＋ ファイルを追加
                    </button>
                  </div>
                </div>
                {pendingFiles.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "16px 0",
                      color: "#cbd5e1",
                      fontSize: 13,
                      border: "2px dashed #e2e8f0",
                      borderRadius: 8,
                    }}
                  >
                    添付ファイルはありません
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      maxHeight: 160,
                      overflowY: "auto",
                    }}
                  >
                    {pendingFiles.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 12px",
                          background: "#f8fafc",
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <span style={{ fontSize: 18 }}>
                          {getFileIcon(f.type)}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#1e293b",
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {f.name}
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>
                            {formatFileSize(f.size)}
                          </div>
                        </div>
                        <button
                          onClick={() => removePendingFile(i)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#fca5a5",
                            fontSize: 16,
                            padding: 4,
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          {editing ? (
            <button
              onClick={onDelete}
              style={{
                ...btnStyle("#ef4444"),
                background: "transparent",
                color: "#ef4444",
                border: "1px solid #fca5a5",
              }}
            >
              削除
            </button>
          ) : (
            <div />
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={btnStyle("#94a3b8")}>
              キャンセル
            </button>
            <button
              onClick={() => onSubmit(pendingFiles)}
              style={btnStyle("#3b82f6")}
            >
              {editing ? "更新" : "登録"}
            </button>
          </div>
        </div>
      </div>

      {showClientSelect && (
        <ClientSelectModal
          clients={clients}
          selectedId={form.client_id}
          onSelect={(client) => {
            set({ client_id: client.id });
            setShowClientSelect(false);
          }}
          onClose={() => setShowClientSelect(false)}
          onClientAdded={onClientAdded}
        />
      )}
    </div>
  );
}
