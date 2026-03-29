import type { Status, Client, User } from "../types";
import { btnStyle, lbl, lbTxt, inp } from "../styles";

type Props = {
  tempFilterStatus: number | "";
  tempFilterAssignee: number | "";
  tempFilterClient: number | "";
  statuses: Status[];
  users: User[];
  clients: Client[];
  onStatusChange: (v: number | "") => void;
  onAssigneeChange: (v: number | "") => void;
  onClientChange: (v: number | "") => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
};

export default function FilterModal({ tempFilterStatus, tempFilterAssignee, tempFilterClient, statuses, users, clients, onStatusChange, onAssigneeChange, onClientChange, onApply, onReset, onClose }: Props) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 32, width: 420, maxWidth: "90vw" }}>
        <h2 style={{ margin: "0 0 24px", fontSize: 18, color: "#1e293b" }}>絞り込み条件</h2>
        <label style={lbl}><span style={lbTxt}>ステータス</span>
          <select value={tempFilterStatus} onChange={(e) => onStatusChange(e.target.value ? Number(e.target.value) : "")} style={inp}>
            <option value="">すべてのステータス</option>
            {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label style={lbl}><span style={lbTxt}>担当者</span>
          <select value={tempFilterAssignee} onChange={(e) => onAssigneeChange(e.target.value ? Number(e.target.value) : "")} style={inp}>
            <option value="">すべての担当者</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.display_name}</option>)}
          </select>
        </label>
        <label style={{ ...lbl, marginBottom: 28 }}><span style={lbTxt}>クライアント</span>
          <select value={tempFilterClient} onChange={(e) => onClientChange(e.target.value ? Number(e.target.value) : "")} style={inp}>
            <option value="">すべてのクライアント</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={onReset} style={{ ...btnStyle("#6b7280"), background: "transparent", color: "#6b7280", border: "1px solid #d1d5db" }}>リセット</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={btnStyle("#94a3b8")}>キャンセル</button>
            <button onClick={onApply} style={btnStyle("#3b82f6")}>適用する</button>
          </div>
        </div>
      </div>
    </div>
  );
}
