export default function Loading() {
  return (
    <main className="app-loading" aria-live="polite">
      <div className="app-loading__mark" aria-hidden="true">✦</div>
      <p>Preparing your map</p>
      <span className="app-loading__bar" aria-hidden="true" />
    </main>
  )
}
