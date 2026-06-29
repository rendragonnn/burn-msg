import ScrollReveal from '@/components/ScrollReveal';
import styles from './about.module.css';

export const metadata = {
  title: 'About — BurnMsg',
  description: 'Learn about BurnMsg, our mission for privacy, and how our zero-knowledge encryption works.',
};

export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      <div className={styles.hero}>
        <h1>About BurnMsg</h1>
        <p>Privacy is not a feature — it&apos;s a right.</p>
      </div>

      <ScrollReveal>
        <div className={styles.section}>
          <h2>Why We Built This</h2>
          <p>
            In a world where every message, every file, and every conversation is logged, 
            stored, and analyzed, we believe there should be a way to communicate that truly 
            leaves no trace. BurnMsg was built on a simple principle: your private messages 
            should be exactly that — private.
          </p>
          <p>
            We don&apos;t store your messages. We can&apos;t read your messages. We don&apos;t 
            even know what you&apos;re sending. Our zero-knowledge architecture ensures that 
            the only people who can read your messages are the people you share your link with.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className={styles.section}>
          <h2>How The Encryption Works</h2>
          <p>
            Every message is encrypted directly in your browser before it ever reaches our servers. 
            The decryption key is embedded in the URL fragment (the part after #), which is never 
            sent to our servers by browsers.
          </p>
          <div className={styles.encryptionFlow}>
            <div className={styles.flowStep}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>
              </svg>
              <span>Write</span>
            </div>
            <svg className={styles.flowArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <div className={styles.flowStep}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Encrypt (Browser)</span>
            </div>
            <svg className={styles.flowArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <div className={styles.flowStep}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>
              </svg>
              <span>Store Ciphertext</span>
            </div>
            <svg className={styles.flowArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <div className={styles.flowStep}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9 1"/>
              </svg>
              <span>Decrypt (Browser)</span>
            </div>
            <svg className={styles.flowArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <div className={styles.flowStep}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
              <span>Burn</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <div className={styles.section}>
          <h2>Zero-Knowledge Architecture</h2>
          <p>
            &ldquo;Zero-knowledge&rdquo; means our server never has access to the information 
            needed to decrypt your messages. The encryption key lives only in the URL you share — 
            it&apos;s never transmitted to our servers. Even if our database were compromised, 
            attackers would find only meaningless encrypted data.
          </p>
          <p>
            We use <strong>AES-256-GCM</strong> — the same encryption standard used by 
            governments and military organizations worldwide. Combined with random initialization 
            vectors and browser-generated keys, your messages are protected by the strongest 
            encryption available.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={300}>
        <div className={styles.openSourceCard}>
          <h3>🔓 Open Source</h3>
          <p>
            BurnMsg is fully open source. You can inspect every line of code, 
            verify our security claims, and even host your own instance.
          </p>
          <a
            href="https://github.com/rendragonnn"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            View on GitHub
          </a>
        </div>
      </ScrollReveal>
    </div>
  );
}
