'use client'

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className="app-error" role="alert">
      <div className="app-error__eyebrow">VibeMap / connection paused</div>
      <h1>We lost the signal.</h1>
      <p>The map could not finish loading. Try the connection again.</p>
      <button onClick={reset}>Try again</button>
    </main>
  )
}
