import type { Toast } from "../types";

export default function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 200 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: t.type === "success" ? "#f0fdf4" : "#fef2f2",
          color: t.type === "success" ? "#15803d" : "#dc2626",
          border: `1px solid ${t.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          borderRadius: 10, padding: "12px 18px", fontSize: 13, fontWeight: 600,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: 200,
          animation: "fadeIn 0.2s ease",
        }}>
          {t.type === "success" ? "✓ " : "✗ "}{t.message}
        </div>
      ))}
    </div>
  );
}
