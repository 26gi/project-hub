type Props = {
  activeNav: string;
  onNavChange: (nav: string) => void;
  onCreateClick: () => void;
};

export default function Header({ onCreateClick }: Props) {
  return (
    <div
      style={{
        background: "#1e293b",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        gap: 32,
        flexShrink: 0,
        height: 52,
      }}
    >
      <span style={{ fontSize: 16, color: "#fff", fontWeight: 700 }}>
        📋 案件管理システム
      </span>
      <div style={{ flex: 1 }} />
      <button
        onClick={onCreateClick}
        style={{
          background: "#3b82f6",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "6px 16px",
          fontSize: 13,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        ＋ 新規登録
      </button>
    </div>
  );
}
