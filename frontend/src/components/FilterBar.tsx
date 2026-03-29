import type { Status, Client, User } from "../types";

type Props = {
  q: string;
  onQChange: (v: string) => void;
  filterStatus: number | "";
  filterAssignee: number | "";
  filterClient: number | "";
  sortOrder: "asc" | "desc" | "";
  onSortChange: (v: "asc" | "desc" | "") => void;
  onFilterStatusChange: (v: number | "") => void;
  onFilterAssigneeChange: (v: number | "") => void;
  onFilterClientChange: (v: number | "") => void;
  statuses: Status[];
  users: User[];
  clients: Client[];
  totalCount: number;
  totalAmount: number;
};

export default function FilterBar({
  filterStatus,
  filterAssignee,
  filterClient,
  sortOrder,
  onSortChange,
  onFilterStatusChange,
  onFilterAssigneeChange,
  onFilterClientChange,
  statuses,
  users,
  clients,
  totalCount,
  totalAmount,
}: Props) {
  return (
    <div
      style={{
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        padding: "10px 24px",
        display: "flex",
        gap: 10,
        alignItems: "center",
        flexWrap: "wrap",
        flexShrink: 0,
      }}
    >
      {/* 件数・合計 */}
      <span style={{ fontSize: 13, color: "#64748b", marginRight: 4 }}>
        <b style={{ color: "#1e293b" }}>{totalCount}</b> 件　合計：
        <b style={{ color: "#1e293b" }}>¥{totalAmount.toLocaleString()}</b>
      </span>

      <div
        style={{ width: 1, height: 20, background: "#e2e8f0", margin: "0 4px" }}
      />

      {/* ステータス */}
      <select
        value={filterStatus}
        onChange={(e) =>
          onFilterStatusChange(e.target.value ? Number(e.target.value) : "")
        }
        style={{
          padding: "5px 10px",
          border: "1px solid #d1d5db",
          borderRadius: 6,
          fontSize: 13,
          background: filterStatus ? "#eff6ff" : "#fff",
          color: filterStatus ? "#3b82f6" : "#374151",
        }}
      >
        <option value="">すべてのステータス</option>
        {statuses.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* 担当者 */}
      <select
        value={filterAssignee}
        onChange={(e) =>
          onFilterAssigneeChange(e.target.value ? Number(e.target.value) : "")
        }
        style={{
          padding: "5px 10px",
          border: "1px solid #d1d5db",
          borderRadius: 6,
          fontSize: 13,
          background: filterAssignee ? "#eff6ff" : "#fff",
          color: filterAssignee ? "#3b82f6" : "#374151",
        }}
      >
        <option value="">すべての担当者</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.display_name}
          </option>
        ))}
      </select>

      {/* クライアント */}
      <select
        value={filterClient}
        onChange={(e) =>
          onFilterClientChange(e.target.value ? Number(e.target.value) : "")
        }
        style={{
          padding: "5px 10px",
          border: "1px solid #d1d5db",
          borderRadius: 6,
          fontSize: 13,
          background: filterClient ? "#eff6ff" : "#fff",
          color: filterClient ? "#3b82f6" : "#374151",
        }}
      >
        <option value="">すべてのクライアント</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* 納期ソート */}
      <select
        value={sortOrder}
        onChange={(e) => onSortChange(e.target.value as "asc" | "desc" | "")}
        style={{
          padding: "5px 10px",
          border: "1px solid #d1d5db",
          borderRadius: 6,
          fontSize: 13,
          background: sortOrder ? "#eff6ff" : "#fff",
          color: sortOrder ? "#3b82f6" : "#374151",
        }}
      >
        <option value="">並び替え：納期</option>
        <option value="asc">納期：昇順</option>
        <option value="desc">納期：降順</option>
      </select>

      {/* リセットボタン */}
      {(filterStatus || filterAssignee || filterClient || sortOrder) && (
        <button
          onClick={() => {
            onFilterStatusChange("");
            onFilterAssigneeChange("");
            onFilterClientChange("");
            onSortChange("");
          }}
          style={{
            padding: "5px 10px",
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            fontSize: 12,
            background: "#f1f5f9",
            color: "#64748b",
            cursor: "pointer",
          }}
        >
          リセット
        </button>
      )}
    </div>
  );
}
