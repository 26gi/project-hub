import { useState } from "react";
import type { Case, CaseForm, Status, Client, User, Phase } from "../types";
import Avatar from "./Avatar";
import { isOverdue } from "../styles";
import { useInlineEdit } from "../hooks/useInlineEdit";

type Props = {
  c: Case;
  statuses: Status[];
  clients: Client[];
  users: User[];
  phases: Phase[];
  onSaved: () => void;
  onDelete: () => void;
  onRowClick: (c: Case) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
};

const fieldInput: React.CSSProperties = {
  width: "100%",
  padding: "3px 6px",
  border: "1px solid #3b82f6",
  borderRadius: 4,
  fontSize: 12,
  background: "#fff",
  color: "#374151",
  outline: "none",
};

export default function CaseCard({
  c,
  statuses,
  clients,
  users,
  phases,
  onSaved,
  onDelete,
  onRowClick,
  isDragging,
  onDragStart,
  onDragEnd,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const overdue = isOverdue(c.due_date);
  const {
    tempValue,
    setTempValue,
    startEdit,
    cancelEdit,
    commitEdit,
    isEditing,
  } = useInlineEdit(onSaved) as any;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onRowClick(c)}
      style={{
        background: overdue ? "#fef2f2" : "#fff",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: hovered
          ? "0 4px 12px rgba(0,0,0,0.12)"
          : "0 1px 3px rgba(0,0,0,0.07)",
        cursor: "pointer",
        opacity: isDragging ? 0.45 : 1,
        transition: "box-shadow 0.15s, opacity 0.15s",
        border: overdue ? "1px solid #fca5a5" : "1px solid #e2e8f0",
        position: "relative",
        width: "100%",
        minWidth: 0,
        flexShrink: 0,
        height: 190,
      }}
    >
      {/* カラーバー */}
      <div
        style={{
          height: 4,
          background: overdue ? "#ef4444" : (c.status_color ?? "#9ca3af"),
        }}
      />

      <div
        style={{
          padding: "10px 12px",
          overflow: "hidden",
          height: "calc(100% - 4px)",
        }}
      >
        {/* ホバー時の削除ボタン */}
        {hovered && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 8,
              display: "flex",
              gap: 4,
              zIndex: 10,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onDelete}
              title="削除"
              style={{
                background: "#fef2f2",
                border: "none",
                borderRadius: 4,
                width: 26,
                height: 26,
                cursor: "pointer",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🗑️
            </button>
          </div>
        )}

        {/* ステータスバッジ */}
        <div style={{ marginBottom: 6 }}>
          <span
            style={{
              background: (c.status_color ?? "#9ca3af") + "22",
              color: c.status_color ?? "#9ca3af",
              padding: "2px 8px",
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {c.status_name ?? "—"}
          </span>
        </div>

        {/* 案件名 */}
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "#1e293b",
            marginBottom: 4,
            paddingRight: hovered ? 32 : 0,
          }}
        >
          {c.title}
        </div>

        {/* 企業名 */}
        <div style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>
          {c.client_name ?? "—"}
        </div>

        {/* 納期・受注金額 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: overdue ? "#ef4444" : "#64748b",
              fontWeight: overdue ? 700 : 400,
            }}
          >
            {overdue ? "⚠ " : "📅 "}
            {c.due_date ?? "—"}
            {overdue && " 期限切れ"}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            💴{" "}
            {c.order_amount != null
              ? "¥" + c.order_amount.toLocaleString()
              : "—"}
          </div>
        </div>

        {/* 担当者アバター */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Avatar name={c.assignee_name ?? "?"} size={22} />
          <span style={{ fontSize: 11, color: "#64748b" }}>
            {c.assignee_name ?? "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
