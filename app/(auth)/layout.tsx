export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      backgroundColor: "#f0f2ff",
      backgroundImage: [
        "radial-gradient(at 25% 10%, rgba(99,102,241,0.28) 0px, transparent 55%)",
        "radial-gradient(at 80% 5%, rgba(139,92,246,0.22) 0px, transparent 50%)",
        "radial-gradient(at 75% 80%, rgba(99,102,241,0.18) 0px, transparent 50%)",
        "radial-gradient(at 5% 65%, rgba(167,139,250,0.18) 0px, transparent 50%)",
        "radial-gradient(at 50% 50%, rgba(255,255,255,0.6) 0px, transparent 60%)",
      ].join(", "),
      position: "relative",
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: "absolute", top: "8%", left: "15%",
        width: 280, height: 280,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "12%", right: "10%",
        width: 320, height: 320,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Glass card */}
      <div style={{
        width: "100%",
        maxWidth: 440,
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRadius: 24,
        padding: "2.75rem 2.5rem",
        boxShadow: "0 4px 6px rgba(0,0,0,0.03), 0 20px 60px rgba(99,102,241,0.12), 0 0 0 1px rgba(255,255,255,0.7)",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 48, height: 48, borderRadius: 14, marginBottom: "0.875rem",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow: "0 8px 20px rgba(99,102,241,0.35)",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12h6v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            KeeperHub
          </div>
          <div style={{ fontSize: "0.72rem", color: "#6366f1", marginTop: 4, letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 600 }}>
            Manajemen Aset HNWI
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
