export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: "1rem",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "#fff",
        borderRadius: "16px",
        padding: "2.5rem 2rem",
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            KeeperHub
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "2px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Manajemen Aset HNWI
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
