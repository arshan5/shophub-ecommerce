export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex-center" style={{ flexDirection: "column", gap: 12, padding: "60px 0" }}>
      <div className="spinner" />
      <span className="text-muted" style={{ fontSize: "0.85rem" }}>
        {label}
      </span>
    </div>
  );
}
