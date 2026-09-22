export default function DashboardLoading() {
  return (
    <main className="route-loading" aria-busy="true" aria-label="Cargando sección">
      <div className="loading-heading"><span className="skeleton skeleton-kicker" /><span className="skeleton skeleton-title" /><span className="skeleton skeleton-copy" /></div>
      <section className="skeleton skeleton-hero" />
      <div className="loading-grid loading-grid--three"><section className="skeleton skeleton-card" /><section className="skeleton skeleton-card" /><section className="skeleton skeleton-card" /></div>
      <div className="loading-grid loading-grid--two"><section className="skeleton skeleton-panel" /><section className="skeleton skeleton-panel" /></div>
    </main>
  );
}
