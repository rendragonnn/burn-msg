import ScrollReveal from '@/components/ScrollReveal';
import styles from './privacy.module.css';

export const metadata = {
  title: 'Privacy Policy — BurnMsg',
  description: 'How BurnMsg protects your privacy with zero-knowledge encryption and minimal data collection.',
};

export default function PrivacyPage() {
  return (
    <div className={styles.privacyPage}>
      <div className={styles.hero}>
        <h1>Privacy Policy</h1>
        <p>Last updated: April 2026</p>
      </div>

      <ScrollReveal>
        <div className={styles.section}>
          <h2>What We Collect</h2>
          <p>BurnMsg collects the absolute minimum data needed to function:</p>
          <ul className={styles.list}>
            <li>
              <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Message ID (random, non-identifying)</span>
            </li>
            <li>
              <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Encrypted ciphertext (unreadable without the key)</span>
            </li>
            <li>
              <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Creation timestamp and expiry settings</span>
            </li>
            <li>
              <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Burn timer and read quota settings</span>
            </li>
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className={styles.section}>
          <h2>What We Do NOT Collect</h2>
          <p>We are fundamentally unable to access the following:</p>
          <ul className={styles.list}>
            <li>
              <svg className={styles.xIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span>Your message content (plaintext)</span>
            </li>
            <li>
              <svg className={styles.xIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span>Decryption keys (stored only in the URL fragment)</span>
            </li>
            <li>
              <svg className={styles.xIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span>IP addresses or browser fingerprints</span>
            </li>
            <li>
              <svg className={styles.xIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span>User accounts, emails, or personal identifiers</span>
            </li>
            <li>
              <svg className={styles.xIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span>Analytics, cookies, or tracking scripts</span>
            </li>
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <div className={styles.section}>
          <h2>Zero-Knowledge Architecture</h2>
          <p>
            BurnMsg uses a zero-knowledge design where your browser handles all encryption 
            and decryption. The AES-256-GCM encryption key is generated in your browser and 
            embedded in the URL fragment (the part after the # symbol). By design, browsers 
            never send URL fragments to servers — meaning we physically cannot access your 
            decryption key.
          </p>
          <p>
            Even if our servers were compromised, an attacker would only find encrypted 
            ciphertext — useless without the key that only exists in the shared URL.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={300}>
        <div className={styles.section}>
          <h2>Data Retention</h2>
          <p>
            Messages are automatically and permanently deleted when any of the following occurs:
          </p>
          <ul className={styles.list}>
            <li>
              <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>The message is read and the burn timer expires</span>
            </li>
            <li>
              <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>The link expiration time is reached</span>
            </li>
            <li>
              <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>The maximum reader quota is reached</span>
            </li>
          </ul>
          <p>
            Once deleted, messages cannot be recovered by anyone — including us.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={400}>
        <div className={styles.highlightCard}>
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            </svg>
            Our Promise
          </h3>
          <p>
            We built BurnMsg because we believe privacy is a fundamental right, not a premium 
            feature. Our code is open source — you can verify every claim we make. If you 
            find a vulnerability, please report it responsibly through our GitHub repository.
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}
