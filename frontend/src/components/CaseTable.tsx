import type { Case, Status, Client, User, Phase } from "../types";
import Avatar from "./Avatar";
import { isOverdue, tdStyle } from "../styles";

type Props = {
  cases: Case[];
  statuses: Status[];
  clients: Client[];
  users: User[];
  phases: Phase[];
  onSaved: () => void;
  onEdit: (c: Case) => void;
  onRowClick: (c: Case) => void;
};

export default function CaseTable({ cases, onRowClick }: Props) {
  const isPhaseOverdue = (
    phaseDueDate: string | null,
    progressPhaseId: number | null,
  ): boolean => {
    if (!phaseDueDate || progressPhaseId === null) return false;
    return new Date(phaseDueDate) < new Date(new Date().toDateString());
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {[
              "企業名",
              "案件名",
              "担当者",
              "ステータス",
              "フェーズ",
              "納期",
              "受注金額",
            ].map((h) => (
              <th
                key={h}
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  fontSize: 12,
                  color: "#64748b",
                  fontWeight: 600,
                  borderBottom: "1px solid #e2e8f0",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cases.length === 0 && (
            <tr>
              <td
                colSpan={7}
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: 13,
                }}
              >
                案件がありません
              </td>
            </tr>
          )}
          {cases.map((c) => {
            const overdue = isOverdue(c.due_date);
            return (
              <tr
                key={c.id}
                onClick={() => onRowClick(c)}
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  background: overdue ? "#fef2f2" : "transparent",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = overdue
                    ? "#fee2e2"
                    : "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = overdue
                    ? "#fef2f2"
                    : "transparent";
                }}
              >
                <td style={tdStyle()}>{c.client_name ?? "—"}</td>
                <td style={tdStyle()}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    {overdue && (
                      <span
                        style={{
                          color: "#ef4444",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        ⚠
                      </span>
                    )}
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#1e293b",
                      }}
                    >
                      {c.title}
                    </span>
                  </div>
                </td>
                <td style={tdStyle()}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Avatar name={c.assignee_name ?? "?"} size={22} />
                    <span style={{ fontSize: 13 }}>
                      {c.assignee_name ?? "—"}
                    </span>
                  </div>
                </td>
                <td style={tdStyle()}>
                  <span
                    style={{
                      background: (c.status_color ?? "#9ca3af") + "22",
                      color: c.status_color ?? "#9ca3af",
                      padding: "2px 10px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {c.status_name ?? "—"}
                  </span>
                </td>
                {/* フェーズ */}
                <td style={tdStyle()}>
                  {(() => {
                    const phaseOverdue = isPhaseOverdue(
                      c.phase_due_date,
                      c.progress_phase_id,
                    );
                    return (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {phaseOverdue && (
                          <span
                            style={{
                              background: "#fef2f2",
                              color: "#ef4444",
                              border: "1px solid #fecaca",
                              borderRadius: 4,
                              padding: "1px 6px",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            ⚠ 期限切れ
                          </span>
                        )}
                        <span
                          style={{
                            color: phaseOverdue ? "#ef4444" : "#374151",
                            fontWeight: phaseOverdue ? 700 : 400,
                          }}
                        >
                          {c.phase_name ?? "—"}
                        </span>
                        {c.phase_due_date && (
                          <span
                            style={{
                              fontSize: 11,
                              color: phaseOverdue ? "#ef4444" : "#94a3b8",
                            }}
                          >
                            ({c.phase_due_date})
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </td>
                <td
                  style={{
                    ...tdStyle(),
                    color: overdue ? "#ef4444" : "#374151",
                    fontWeight: overdue ? 700 : 400,
                  }}
                >
                  {c.due_date ?? "—"}
                </td>
                <td style={tdStyle()}>
                  {c.order_amount != null
                    ? "¥" + c.order_amount.toLocaleString()
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
