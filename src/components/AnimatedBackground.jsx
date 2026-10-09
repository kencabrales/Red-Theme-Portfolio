export default function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      style={{
        background: [
          "radial-gradient(ellipse at 50% 0%, rgba(127,29,29,0.55), transparent 60%)",
          "radial-gradient(ellipse at 15% 85%, rgba(153,27,27,0.35), transparent 55%)",
          "radial-gradient(ellipse at 90% 60%, rgba(127,29,29,0.3), transparent 50%)",
          "linear-gradient(180deg, #1a0407 0%, #0d0204 100%)",
        ].join(", "),
      }}
    >
      {/* dark edges so text stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
}
