const AVATAR_COLORS = ["#7F77DD","#1D9E75","#D85A30","#D4537E","#378ADD","#639922","#BA7517"];

export default function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  const initial = name ? name[0] : "?";
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "22", color,
      border: `1.5px solid ${color}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.42, fontWeight: 600, flexShrink: 0,
    }}>
      {initial}
    </div>
  );
}
