import { useState } from "react";
import type { Client } from "../types";
import { api } from "../api/cases";

type Props = {
  clients: Client[];
  selectedId: number;
  onSelect: (client: Client) => void;
  onClose: () => void;
  onClientAdded: (client: Client) => void;
};

export default function ClientSelectModal({ clients, selectedId, onSelect, onClose, onClientAdded }: Props) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newName.trim()) { setError("企業名を入力してください"); return; }
    setSaving(true);
    try {
      const created = await api.clients.create(newName.trim());
      onClientAdded(created);
      onSelect(created);
    } catch {
      setError("登録に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 12, width: 420, maxWidth: "90vw", maxHeight: "70vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>企業を選択</span>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18 }}>✕</button>
          </div>
          <input
            autoFocus
            placeholder="企業名で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box", outline: "none", background: "#fff", color: "#374151" }}
          />
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {filtered.length === 0 && (
            <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>該当する企業がありません</div>
          )}
          {filtered.map((c) => (
            <div key={c.id} onClick={() => onSelect(c)}
              style={{ padding: "10px 20px", cursor: "pointer", fontSize: 14, background: c.id === selectedId ? "#eff6ff" : "transparent", color: c.id === selectedId ? "#3b82f6" : "#1e293b", fontWeight: c.id === selectedId ? 600 : 400, borderLeft: c.id === selectedId ? "3px solid #3b82f6" : "3px solid transparent", display: "flex", alignItems: "center", justifyContent: "space-between" }}
              onMouseEnter={(e) => { if (c.id !== selectedId) e.currentTarget.style.background = "#f8fafc"; }}
              onMouseLeave={(e) => { if (c.id !== selectedId) e.currentTarget.style.background = "transparent"; }}
            >
              <span>{c.name}</span>
              {c.id === selectedId && <span style={{ fontSize: 12, color: "#3b82f6" }}>✓</span>}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "12px 20px" }}>
          {showAdd ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  autoFocus type="text" placeholder="新しい企業名を入力"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setShowAdd(false); }}
                  style={{ flex: 1, padding: "6px 10px", border: "1px solid #3b82f6", borderRadius: 6, fontSize: 13, outline: "none", background: "#fff", color: "#374151" }}
                />
                <button onClick={handleAdd} disabled={saving}
                  style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: saving ? "not-allowed" : "pointer", fontWeight: 600 }}>
                  {saving ? "..." : "追加"}
                </button>
                <button onClick={() => { setShowAdd(false); setNewName(""); setError(""); }}
                  style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
                  取消
                </button>
              </div>
              {error && <span style={{ fontSize: 11, color: "#ef4444" }}>{error}</span>}
            </div>
          ) : (
            <button onClick={() => setShowAdd(true)}
              style={{ width: "100%", padding: "8px", background: "none", border: "1px dashed #d1d5db", borderRadius: 6, color: "#64748b", fontSize: 13, cursor: "pointer", textAlign: "center" }}>
              ＋ 新しい企業を追加
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
