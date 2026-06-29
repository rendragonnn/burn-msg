'use client';

import { useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';
import styles from './faq.module.css';

const faqs = [
  {
    q: 'Is BurnMsg really secure?',
    a: 'Yes. BurnMsg uses AES-256-GCM encryption — the same standard used by governments and financial institutions. All encryption and decryption happens directly in your browser. Our servers never see your plaintext messages or encryption keys.',
  },
  {
    q: 'Can you read my messages?',
    a: 'No. This is the core of our zero-knowledge architecture. Your message is encrypted in your browser before being sent to our server. The decryption key is stored in the URL fragment (the part after #), which browsers never send to servers. We literally cannot decrypt your messages.',
  },
  {
    q: 'What encryption does BurnMsg use?',
    a: 'We use AES-256-GCM (Advanced Encryption Standard with 256-bit key in Galois/Counter Mode). This provides both confidentiality and authenticity — meaning the message cannot be read or tampered with by anyone without the key.',
  },
  {
    q: 'What happens after a message is read?',
    a: 'Once a message is opened and the reading time expires, it is permanently deleted from our servers. The burn animation you see is not just for show — the data is genuinely destroyed. There is no way to recover a burned message.',
  },
  {
    q: 'Is there a file size limit?',
    a: 'Yes, currently files and voice memos are limited to 3 MB. This keeps the service fast and free. Text messages can be up to 50,000 characters.',
  },
  {
    q: 'Can I set a custom expiration time?',
    a: 'Absolutely. You can set how long the link stays active (from 5 minutes to 30 days, or custom), how long the recipient has to read before auto-burn, and how many people can view the message.',
  },
  {
    q: 'Is BurnMsg open source?',
    a: 'Yes! BurnMsg is fully open source. You can review the code, verify our security claims, report vulnerabilities, or even host your own instance. Check out our GitHub repository.',
  },
  {
    q: 'Do you store any logs or metadata?',
    a: 'We store minimal metadata: a message ID, creation timestamp, expiry time, and burn settings. We do NOT store IP addresses, browser fingerprints, message content, or decryption keys. All metadata is deleted when the message is burned.',
  },
];

function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`${styles.faqItem} ${open ? styles.faqItemOpen : ''}`}>
      <button className={styles.question} onClick={() => setOpen(!open)}>
        {q}
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div className={`${styles.answer} ${open ? styles.answerOpen : ''}`}>
        <div className={styles.answerContent}>{a}</div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className={styles.faqPage}>
      <div className={styles.hero}>
        <h1>Frequently Asked Questions</h1>
        <p>Everything you need to know about BurnMsg</p>
      </div>

      <div className={styles.faqList}>
        {faqs.map((faq, i) => (
          <ScrollReveal key={i} delay={i * 50}>
            <FAQItem q={faq.q} a={faq.a} index={i} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
