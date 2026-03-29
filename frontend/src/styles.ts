import type React from "react";

export const btnStyle = (color: string): React.CSSProperties => ({
  background: color, color: "#fff", border: "none", borderRadius: 6,
  cursor: "pointer", padding: "8px 18px", fontSize: 14, fontWeight: 600,
});

export const tagStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe",
  borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600,
};

export const tagClose: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer",
  color: "#93c5fd", fontSize: 14, padding: 0, lineHeight: 1,
};

export const lbl: React.CSSProperties = { display: "block", marginBottom: 16 };

export const lbTxt: React.CSSProperties = {
  fontSize: 13, color: "#374151", display: "block", marginBottom: 4, fontWeight: 600,
};

export const inp: React.CSSProperties = {
  width: "100%", padding: "8px 12px", border: "1px solid #d1d5db",
  borderRadius: 6, fontSize: 14, boxSizing: "border-box",
  background: "#fff", color: "#374151", colorScheme: "light" as const,
};

export const errTxt: React.CSSProperties = {
  fontSize: 12, color: "#ef4444", marginTop: 4, display: "block",
};

export const tdStyle = (): React.CSSProperties => ({
  padding: "10px 14px", fontSize: 13, color: "#374151",
});

export const isOverdue = (dueDate: string | null): boolean =>
  dueDate ? new Date(dueDate) < new Date(new Date().toDateString()) : false;
