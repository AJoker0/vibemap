import Link from 'next/link'
import styles from './privacy.module.css'

export const metadata = {
  title: 'Privacy | VibeMap',
  description: 'How VibeMap handles account and location data.',
}

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <article className={styles.card}>
        <Link href="/auth" className={styles.back}>Back to VibeMap</Link>
        <p className={styles.eyebrow}>Privacy notes / beta</p>
        <h1>Your place is yours.</h1>
        <p className={styles.lead}>VibeMap is designed around approximate, short-lived location signals rather than a permanent movement log.</p>
        <section><h2>What we store</h2><p>Account details, mood entries, approximate coordinates, cities and settings needed to provide the map. Active vibes expire after 24 hours.</p></section>
        <section><h2>What we do not promise</h2><p>This page is a product preview, not legal advice. Before public launch, VibeMap needs a reviewed GDPR privacy policy, data processor agreements and a formal retention schedule.</p></section>
        <section><h2>Your controls</h2><p>You can sign out, change profile settings and permanently delete your account and associated data from Settings.</p></section>
        <section><h2>Age and consent</h2><p>Do not use the beta unless you are old enough to consent to the processing of location data where you live. Never share another person’s location without their permission.</p></section>
      </article>
    </main>
  )
}
