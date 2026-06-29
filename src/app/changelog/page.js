import ScrollReveal from '@/components/ScrollReveal';
import styles from './changelog.module.css';

export const metadata = {
  title: 'Changelog — BurnMsg',
  description: 'See what\'s new in BurnMsg — latest features, security updates, and improvements.',
};

const entries = [
  {
    version: 'v2.4',
    date: 'April 2026',
    latest: true,
    features: [
      { tag: 'security', text: 'Anti-Screenshot Mode with dynamic watermarking' },
      { tag: 'feature', text: 'Hold to Reveal — messages stay blurred until held' },
      { tag: 'improve', text: 'Enhanced burn animation effects' },
    ],
  },
  {
    version: 'v2.3',
    date: 'April 2026',
    features: [
      { tag: 'feature', text: 'Voice Memos — encrypted audio messages up to 2 minutes' },
      { tag: 'feature', text: 'Custom Burn Timer — set exact reading time before auto-burn' },
      { tag: 'improve', text: 'Improved mobile responsive design' },
    ],
  },
  {
    version: 'v2.2',
    date: 'April 2026',
    features: [
      { tag: 'feature', text: 'Telegram Notifications — get pinged when message is opened' },
      { tag: 'feature', text: 'Reader Quota — limit how many people can read a message' },
      { tag: 'fix', text: 'Fixed edge case with custom expiry calculations' },
    ],
  },
  {
    version: 'v2.1',
    date: 'April 2026',
    features: [
      { tag: 'feature', text: 'File Attachments — send encrypted files up to 3 MB' },
      { tag: 'feature', text: 'Download Control — allow or block file downloads' },
      { tag: 'security', text: 'Password protection for sensitive messages' },
    ],
  },
  {
    version: 'v2.0',
    date: 'April 2026',
    features: [
      { tag: 'security', text: 'AES-256-GCM encryption with browser-generated keys' },
      { tag: 'feature', text: 'One-time links with configurable expiry' },
      { tag: 'feature', text: 'Zero-knowledge architecture — server never sees plaintext' },
    ],
  },
  {
    version: 'v1.0',
    date: 'March 2026',
    features: [
      { tag: 'feature', text: 'Initial release — basic encrypted messaging' },
      { tag: 'feature', text: 'Self-destructing messages after single read' },
    ],
  },
];

const tagStyles = {
  feature: styles.tagFeature,
  security: styles.tagSecurity,
  fix: styles.tagFix,
  improve: styles.tagImprove,
};

export default function ChangelogPage() {
  return (
    <div className={styles.changelogPage}>
      <div className={styles.hero}>
        <h1>Changelog</h1>
        <p>What&apos;s new in BurnMsg</p>
      </div>

      <div className={styles.timeline}>
        {entries.map((entry, i) => (
          <ScrollReveal key={i} delay={i * 80}>
            <div className={styles.entry}>
              <div className={`${styles.dot} ${entry.latest ? styles.latestDot : ''}`} />
              <div className={styles.entryHeader}>
                <span className={styles.version}>{entry.version}</span>
                <span className={styles.date}>{entry.date}</span>
              </div>
              <ul className={styles.features}>
                {entry.features.map((f, j) => (
                  <li key={j} className={styles.feature}>
                    <span className={`${styles.tag} ${tagStyles[f.tag] || ''}`}>
                      {f.tag}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
