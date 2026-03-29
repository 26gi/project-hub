import type { Case, Phase, Status, Client, User } from "../types";
import CaseCard from "./CaseCard";

type Props = {
  cases: Case[];
  sorted: Case[];
  phases: Phase[];
  statuses: Status[];
  clients: Client[];
  users: User[];
  dragCaseId: number | null;
  dragOverPhaseId: number | null | "none";
  onDragStart: (id: number) => void;
  onDragEnd: () => void;
  onDragOver: (phaseId: number | null) => void;
  onDragLeave: () => void;
  onDrop: (phaseId: number | null) => void;
  onRowClick: (c: Case) => void;
  onDelete: (id: number) => void;
  onSaved: () => void;
};

export default function KanbanBoard({
  sorted,
  phases,
  statuses,
  clients,
  users,
  dragCaseId,
  dragOverPhaseId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onRowClick,
  onDelete,
  onSaved,
}: Props) {
  const allPhases = [{ id: null, name: "未着手" }, ...phases];

  return (
    <div
      style={{
        flex: 1,
        overflowX: "auto",
        overflowY: "hidden",
        padding: "16px 24px",
        display: "flex",
        gap: 12,
        alignItems: "stretch",
        minHeight: 0,
      }}
    >
      {allPhases.map((phase) => {
        const phaseCases = sorted.filter((c) =>
          phase.id === null
            ? c.progress_phase_id === null
            : c.progress_phase_id === phase.id,
        );
        const phaseAmount = phaseCases.reduce(
          (s, c) => s + (c.order_amount ?? 0),
          0,
        );
        const isOver = dragOverPhaseId === (phase.id ?? null);

        return (
          <div
            key={phase.id ?? "none"}
            style={{
              width: 200,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
            onDragOver={(e) => {
              e.preventDefault();
              onDragOver(phase.id ?? null);
            }}
            onDragLeave={onDragLeave}
            onDrop={() => onDrop(phase.id ?? null)}
          >
            {/* カラムヘッダー */}
            <div
              style={{
                background: isOver ? "#dbeafe" : "#f1f5f9",
                borderRadius: "8px 8px 0 0",
                padding: "10px 12px",
                border: "1px solid #e2e8f0",
                borderBottom: "none",
                transition: "background 0.15s",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ fontWeight: 700, fontSize: 13, color: "#334155" }}
                >
                  {phase.name}
                </span>
                <span
                  style={{
                    background: "#cbd5e1",
                    color: "#475569",
                    borderRadius: 10,
                    padding: "1px 8px",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {phaseCases.length}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                ¥{phaseAmount.toLocaleString()}
              </div>
            </div>

            {/* カード一覧 */}
            <div
              className="kanban-column-body"
              style={{
                background: isOver ? "#eff6ff" : "#f8fafc",
                borderRadius: "0 0 8px 8px",
                border: "1px solid #e2e8f0",
                borderTop: "none",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "stretch",
                overflowX: "hidden",
                flex: 1,
                minHeight: 0,
              }}
            >
              {phaseCases.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#cbd5e1",
                    fontSize: 12,
                    padding: "20px 0",
                    border: "2px dashed #e2e8f0",
                    borderRadius: 6,
                  }}
                >
                  案件なし
                </div>
              )}
              {phaseCases.map((c) => (
                <CaseCard
                  key={c.id}
                  c={c}
                  statuses={statuses}
                  clients={clients}
                  users={users}
                  phases={phases}
                  onSaved={onSaved}
                  onDelete={() => onDelete(c.id)}
                  onRowClick={onRowClick}
                  isDragging={dragCaseId === c.id}
                  onDragStart={() => onDragStart(c.id)}
                  onDragEnd={onDragEnd}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
