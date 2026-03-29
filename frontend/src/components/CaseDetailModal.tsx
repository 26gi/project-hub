import { useEffect, useRef, useState } from "react";
import type { Case, CaseFile, Status, Client, User, Phase } from "../types";
import { api, getFileIcon, formatFileSize } from "../api/cases";
import ClientSelectModal from "./ClientSelectModal";

type Props = {
  c: Case;
  statuses: Status[];
  clients: Client[];
  users: User[];
  phases: Phase[];
  onClose: () => void;
  onDelete: () => void;
  onSaved: () => void;
  onClientAdded: (client: Client) => void;
};

const isOverdue = (dueDate: string | null) =>
  dueDate ? new Date(dueDate) < new Date(new Date().toDateString()) : false;

function PhaseStepBar({
  phases,
  currentPhaseId,
  phaseDueDate,
  onSelect,
  onDueDateChange,
}: {
  phases: Phase[];
  currentPhaseId: number | null;
  phaseDueDate: string | null;
  onSelect: (phaseId: number | null) => void;
  onDueDateChange: (date: string | null) => void;
}) {
  const isPhaseOverdue = phaseDueDate
    ? new Date(phaseDueDate) < new Date(new Date().toDateString())
    : false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* ステップ */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          flexWrap: "nowrap",
          overflowX: "auto",
          justifyContent: "center",
        }}
      >
        {phases.map((phase, i) => {
          const isCurrent = phase.id === currentPhaseId;
          const isPast = currentPhaseId !== null && phase.id < currentPhaseId;
          return (
            <div
              key={phase.id}
              style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
            >
              <div
                onClick={() => onSelect(isCurrent ? null : phase.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: 6,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f1f5f9")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: isCurrent
                      ? isPhaseOverdue
                        ? "#ef4444"
                        : "#3b82f6"
                      : isPast
                        ? "#e2e8f0"
                        : "#fff",
                    border: isCurrent
                      ? `2px solid ${isPhaseOverdue ? "#ef4444" : "#3b82f6"}`
                      : isPast
                        ? "2px solid #e2e8f0"
                        : "2px solid #d1d5db",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: isCurrent ? "#fff" : "#94a3b8",
                    boxShadow: isCurrent
                      ? `0 0 0 4px ${isPhaseOverdue ? "#fecaca" : "#bfdbfe"}`
                      : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {isPast ? "✓" : i + 1}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isCurrent ? 700 : 400,
                    color: isCurrent
                      ? isPhaseOverdue
                        ? "#ef4444"
                        : "#3b82f6"
                      : isPast
                        ? "#94a3b8"
                        : "#64748b",
                    whiteSpace: "nowrap",
                  }}
                >
                  {phase.name}
                </span>
              </div>
              {i < phases.length - 1 && (
                <div
                  style={{
                    width: 20,
                    height: 2,
                    flexShrink: 0,
                    background: isPast ? "#cbd5e1" : "#e2e8f0",
                    marginBottom: 16,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* フェーズ期限（現在のフェーズがある場合のみ表示） */}
      {currentPhaseId !== null && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 11, color: "#94a3b8" }}>フェーズ期限：</span>
          <input
            type="date"
            value={phaseDueDate ?? ""}
            onChange={(e) => onDueDateChange(e.target.value || null)}
            style={{
              padding: "2px 8px",
              border: `1px solid ${isPhaseOverdue ? "#ef4444" : "#d1d5db"}`,
              borderRadius: 4,
              fontSize: 11,
              background: isPhaseOverdue ? "#fef2f2" : "#fff",
              color: isPhaseOverdue ? "#ef4444" : "#374151",
              outline: "none",
              colorScheme: "light",
            }}
          />
          {isPhaseOverdue && (
            <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>
              ⚠ 期限切れ
            </span>
          )}
        </div>
      )}
    </div>
  );
}
export default function CaseDetailModal({
  c,
  statuses,
  clients,
  users,
  phases,
  onClose,
  onDelete,
  onSaved,
  onClientAdded,
}: Props) {
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caseData, setCaseData] = useState<Case>(c);
  const [showClientSelect, setShowClientSelect] = useState(false);
  const [editingField, setEditingField] = useState<
    "title" | "due_date" | "order_amount" | "description" | null
  >(null);
  const [tempValue, setTempValue] = useState<string | number | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    api.files.list(c.id).then(setFiles);
  }, [c.id]);

  const startEdit = (
    field: "title" | "due_date" | "order_amount" | "description",
    value: string | number | null,
  ) => {
    console.log("startEdit called:", field, value); // ← 追加
    setEditingField(field);
    setTempValue(value);
    setIsDirty(true);
  };

  const commitEdit = async () => {
    const updated = await api.cases.update(caseData.id, {
      title: caseData.title,
      client_id: caseData.client_id,
      assignee_id: caseData.assignee_id,
      status_id: caseData.status_id,
      order_amount: caseData.order_amount,
      progress_phase_id: caseData.progress_phase_id,
      due_date: caseData.due_date,
      phase_due_date: caseData.phase_due_date,
      description: caseData.description,
    });
    setCaseData(updated);
    setEditingField(null);
    setTempValue(null);
    setIsDirty(false);
    onSaved();
    onClose(); // ← 追加
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValue(null);
    setIsDirty(false); // ← 追加
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") cancelEdit();
  };

  const handleClose = () => {
    if (isDirty) {
      const confirmed = confirm(
        "保存されていない変更があります。\n閉じてもよろしいですか？",
      );
      if (!confirmed) return;
    }
    onClose();
  };

  const editableStyle: React.CSSProperties = {
    cursor: "text",
    padding: "5px 8px",
    borderRadius: 4,
    border: "1px solid transparent",
    transition: "border 0.15s",
    fontSize: 14,
    color: "#374151",
  };

  const fieldInput: React.CSSProperties = {
    width: "100%",
    padding: "5px 8px",
    border: "1px solid #3b82f6",
    borderRadius: 4,
    fontSize: 14,
    background: "#fff",
    color: "#374151",
    outline: "none",
  };

  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "5px 8px",
    border: "1px solid #d1d5db",
    borderRadius: 4,
    fontSize: 14,
    background: "#fff",
    color: "#374151",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: 600,
    marginBottom: 4,
  };

  const overdue = isOverdue(caseData.due_date);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.files.upload(caseData.id, file);
      setFiles(await api.files.list(caseData.id));
      setIsDirty(true); // ← 追加
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileDelete = async (fileId: number) => {
    if (!confirm("このファイルを削除しますか？")) return;
    await api.files.delete(caseData.id, fileId);
    setFiles((f) => f.filter((x) => x.id !== fileId));
    setIsDirty(true); // ← 追加
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
      onClick={handleClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          width: 900,
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* カラーバー */}
        <div
          style={{
            height: 6,
            background: overdue
              ? "#ef4444"
              : (caseData.status_color ?? "#9ca3af"),
            flexShrink: 0,
          }}
        />
        {/* ヘッダー */}
        <div
          style={{
            padding: "14px 24px 12px",
            borderBottom: "1px solid #f1f5f9",
            flexShrink: 0,
          }}
        >
          {/* 登録日 - 左上 */}
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
            登録日：{new Date(caseData.created_at).toLocaleDateString("ja-JP")}
          </div>
          {/* タイトル行 */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <div style={{ flex: 1, marginRight: 16 }}>
              {editingField === "title" ? (
                // onBlur を削除
                <input
                  autoFocus
                  type="text"
                  value={(tempValue as string) ?? ""}
                  onChange={(e) => {
                    setTempValue(e.target.value);
                    setIsDirty(true);
                  }}
                  onKeyDown={(e) => handleKeyDown(e)}
                  style={{ ...fieldInput, fontSize: 20, fontWeight: 700 }}
                />
              ) : (
                <h2
                  onClick={() => startEdit("title", caseData.title)}
                  style={{
                    margin: 0,
                    fontSize: 20,
                    color: "#1e293b",
                    fontWeight: 700,
                    cursor: "text",
                    padding: "3px 6px",
                    borderRadius: 4,
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.border = "1px solid #e2e8f0")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.border = "1px solid transparent")
                  }
                >
                  {caseData.title}
                </h2>
              )}
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: 20,
                lineHeight: 1,
                padding: 4,
              }}
            >
              ✕
            </button>
          </div>

          {/* ステータス行 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <select
              value={caseData.status_id}
              onChange={async (e) => {
                const newStatusId = Number(e.target.value);
                const newStatus = statuses.find((s) => s.id === newStatusId);
                const currentStatus = statuses.find(
                  (s) => s.id === caseData.status_id,
                );
                const lastPhase = phases[phases.length - 1];

                // 完了 → 他のステータスに戻す場合
                if (
                  currentStatus?.name === "完了" &&
                  newStatus?.name !== "完了"
                ) {
                  const confirmed = confirm(
                    `ステータスを「完了」から「${newStatus?.name}」に戻します。\nよろしいですか？`,
                  );
                  if (!confirmed) return;
                }

                // 進行中 → 未着手に戻す場合
                if (
                  currentStatus?.name === "進行中" &&
                  newStatus?.name === "未着手"
                ) {
                  const confirmed = confirm(
                    "ステータスを「進行中」から「未着手」に戻します。\nよろしいですか？",
                  );
                  if (!confirmed) return;
                }

                // 未着手→完了の場合（既存の確認）
                if (
                  newStatus?.name === "完了" &&
                  lastPhase &&
                  caseData.progress_phase_id !== lastPhase.id
                ) {
                  const currentPhase = phases.find(
                    (p) => p.id === caseData.progress_phase_id,
                  );
                  const confirmed = confirm(
                    `現在のフェーズは「${currentPhase?.name ?? "未設定"}」です。\n最終フェーズ「${lastPhase.name}」に達していませんが、完了にしますか？`,
                  );
                  if (!confirmed) return;
                }

                setCaseData((prev) => ({
                  ...prev,
                  status_id: newStatusId,
                  status_name: newStatus?.name ?? null,
                  status_color: newStatus?.theme_color ?? null,
                }));
                setIsDirty(true);
              }}
              style={{
                padding: "3px 10px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                background: (caseData.status_color ?? "#9ca3af") + "22",
                color: caseData.status_color ?? "#9ca3af",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>{" "}
          </div>
          {/* ステップバー - 未着手以外の時のみ表示 */}
          {statuses.find((s) => s.id === caseData.status_id)?.name !==
            "未着手" && (
            <PhaseStepBar
              phases={phases}
              currentPhaseId={caseData.progress_phase_id}
              phaseDueDate={caseData.phase_due_date}
              onSelect={(phaseId) => {
                const phase = phases.find((p) => p.id === phaseId) ?? null;
                setCaseData((prev) => ({
                  ...prev,
                  progress_phase_id: phaseId,
                  phase_name: phase?.name ?? null,
                }));
                setIsDirty(true);
              }}
              onDueDateChange={(date) => {
                setCaseData((prev) => ({ ...prev, phase_due_date: date }));
                setIsDirty(true);
              }}
            />
          )}
        </div>
        {/* 本文 */}
        <div style={{ padding: "16px 24px", overflowY: "auto", flex: 1 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 40px",
            }}
          >
            {/* 左カラム */}
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px 24px",
                }}
              >
                {/* 企業名 */}
                <div>
                  <div style={labelStyle}>企業名</div>
                  <div
                    onClick={() => setShowClientSelect(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "5px 8px",
                      border: "1px solid #d1d5db",
                      borderRadius: 4,
                      cursor: "pointer",
                      background: "#fff",
                      fontSize: 14,
                      color: "#374151",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "#3b82f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "#d1d5db")
                    }
                  >
                    <span>{caseData.client_name ?? "選択してください"}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>▼</span>
                  </div>
                </div>

                {/* 担当者 */}
                <div>
                  <div style={labelStyle}>担当者</div>
                  <select
                    value={caseData.assignee_id}
                    onChange={(e) => {
                      const userId = Number(e.target.value);
                      const user = users.find((u) => u.id === userId);
                      // commitEdit を呼ばずに一時的に更新
                      setCaseData((prev) => ({
                        ...prev,
                        assignee_id: userId,
                        assignee_name: user?.display_name ?? null,
                      }));
                      setIsDirty(true);
                    }}
                    style={selectStyle}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 納期 */}
                <div>
                  <div style={labelStyle}>納期</div>
                  {editingField === "due_date" ? (
                    <input
                      autoFocus
                      type="date"
                      value={(tempValue as string) ?? ""}
                      onChange={(e) => {
                        setTempValue(e.target.value || null);
                        setIsDirty(true);
                      }}
                      onKeyDown={(e) => handleKeyDown(e)}
                      style={{ ...fieldInput, colorScheme: "light" }}
                    />
                  ) : (
                    <div
                      onClick={() => startEdit("due_date", caseData.due_date)}
                      style={{
                        ...editableStyle,
                        color: overdue ? "#ef4444" : "#374151",
                        fontWeight: overdue ? 700 : 400,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.border = "1px solid #e2e8f0")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.border = "1px solid transparent")
                      }
                    >
                      {overdue && "⚠ "}
                      {caseData.due_date ?? "—"}
                    </div>
                  )}
                </div>

                {/* 受注金額 */}
                <div>
                  <div style={labelStyle}>受注金額</div>
                  {editingField === "order_amount" ? (
                    <input
                      autoFocus
                      type="number"
                      value={(tempValue as number) ?? ""}
                      onChange={(e) => {
                        setTempValue(Number(e.target.value) || null);
                        setIsDirty(true);
                      }}
                      onKeyDown={(e) => handleKeyDown(e)}
                      style={fieldInput}
                    />
                  ) : (
                    <div
                      onClick={() =>
                        startEdit("order_amount", caseData.order_amount)
                      }
                      style={editableStyle}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.border = "1px solid #e2e8f0")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.border = "1px solid transparent")
                      }
                    >
                      {caseData.order_amount != null
                        ? "¥" + caseData.order_amount.toLocaleString()
                        : "—"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右カラム */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* 案件メモ */}
              <div>
                <div style={labelStyle}>案件メモ</div>
                {editingField === "description" ? (
                  <textarea
                    autoFocus
                    value={(tempValue as string) ?? ""}
                    onChange={(e) => {
                      setTempValue(e.target.value || null);
                      setIsDirty(true);
                    }}
                    onKeyDown={(e) => handleKeyDown(e)}
                    rows={3}
                    style={{ ...fieldInput, resize: "vertical", width: "100%" }}
                  />
                ) : (
                  <div
                    onClick={() =>
                      startEdit("description", caseData.description)
                    }
                    style={{
                      fontSize: 14,
                      color: caseData.description ? "#374151" : "#cbd5e1",
                      lineHeight: 1.7,
                      background: "#f8fafc",
                      borderRadius: 8,
                      padding: "10px 14px",
                      border: "1px solid #e2e8f0",
                      minHeight: 60,
                      cursor: "text",
                    }}
                  >
                    {caseData.description ?? "クリックして案件メモを入力..."}
                  </div>
                )}
              </div>

              {/* 添付ファイル */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div style={labelStyle}>添付ファイル（{files.length}件）</div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleUpload}
                      style={{ display: "none" }}
                      accept=".pdf,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      style={{
                        background: uploading ? "#e2e8f0" : "#f1f5f9",
                        color: uploading ? "#94a3b8" : "#475569",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        padding: "5px 12px",
                        fontSize: 12,
                        cursor: uploading ? "not-allowed" : "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {uploading ? "アップロード中..." : "＋ ファイルを追加"}
                    </button>
                  </div>
                </div>
                {files.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px 0",
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
                      gap: 8,
                      maxHeight: 140,
                      overflowY: "auto",
                    }}
                  >
                    {files.map((f) => (
                      <div
                        key={f.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 14px",
                          background: "#f8fafc",
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <span style={{ fontSize: 20 }}>
                          {getFileIcon(f.mime_type)}
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
                            {f.original_name}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#94a3b8",
                              marginTop: 2,
                            }}
                          >
                            {formatFileSize(f.file_size)} ·{" "}
                            {new Date(f.created_at).toLocaleDateString("ja-JP")}
                          </div>
                        </div>
                        <a
                          href={api.files.downloadUrl(caseData.id, f.id)}
                          download={f.original_name}
                          style={{
                            color: "#3b82f6",
                            fontSize: 12,
                            textDecoration: "none",
                            fontWeight: 600,
                            padding: "4px 10px",
                            border: "1px solid #bfdbfe",
                            borderRadius: 6,
                            background: "#eff6ff",
                          }}
                        >
                          DL
                        </a>
                        <button
                          onClick={() => handleFileDelete(f.id)}
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
            </div>
          </div>
        </div>
        {/* フッター */}
        <div
          style={{
            padding: "10px 24px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <button
            onClick={onDelete}
            style={{
              background: "transparent",
              color: "#ef4444",
              border: "1px solid #fca5a5",
              borderRadius: 6,
              padding: "7px 16px",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            削除
          </button>

          {isDirty && (
            <button
              onClick={() => commitEdit()}
              style={{
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "7px 16px",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              保存
            </button>
          )}
        </div>{" "}
      </div>

      {/* 企業名選択モーダル */}
      {showClientSelect && (
        <ClientSelectModal
          clients={clients}
          selectedId={caseData.client_id}
          onSelect={(client) => {
            // commitEdit を呼ばずに一時的に更新
            setCaseData((prev) => ({
              ...prev,
              client_id: client.id,
              client_name: client.name,
            }));
            setIsDirty(true);
            setShowClientSelect(false);
          }}
          onClose={() => setShowClientSelect(false)}
          onClientAdded={onClientAdded}
        />
      )}
    </div>
  );
}
