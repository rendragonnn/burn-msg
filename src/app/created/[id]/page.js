'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import CopyButton from '@/components/CopyButton';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import styles from './page.module.css';

export default function CreatedPage() {
  const params = useParams();
  const [fullLink, setFullLink] = useState('');
  const [show, setShow] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const link = `${window.location.origin}/msg/${params.id}${hash}`;
    setFullLink(link);
    // Trigger entrance animation
    requestAnimationFrame(() => setShow(true));
  }, [params.id]);

  return (
    <div className={`${styles.page} ${show ? styles.show : ''}`}>
      <div className={styles.iconWrapper}>
        <div className={styles.iconGlow} />
        <div className={styles.icon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>
        </div>
      </div>

      <h1 className={styles.title}>Secret Link Created</h1>
      <p className={styles.subtitle}>
        Share this link with your recipient. It can only be opened <strong>once</strong>.
      </p>

      <div className={styles.linkBox}>
        <div className={styles.linkHeader}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          <span>Secret Link</span>
        </div>
        <code className={styles.link}>{fullLink}</code>
        <div className={styles.actionButtons}>
          <CopyButton text={fullLink} />
          <button 
            onClick={() => setShowQR(!showQR)} 
            className={`${styles.qrToggle} ${showQR ? styles.qrActive : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
            {showQR ? 'Hide QR' : 'Show QR Code'}
          </button>
        </div>
        
        {showQR && (
          <div className={styles.qrContainer}>
            <div className={styles.qrWrapper}>
              <QRCodeSVG 
                value={fullLink} 
                size={180} 
                bgColor="transparent" 
                fgColor="#fafafa" 
                includeMargin={false}
              />
            </div>
            <p className={styles.qrHint}>Scan to open securely on mobile</p>
          </div>
        )}
      </div>

      <div className={styles.warnings}>
        <div className={styles.warning}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
          </svg>
          <span>This link will self-destruct after being read</span>
        </div>
        <div className={styles.warning}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>The encryption key is in the link — do not lose it</span>
        </div>
        <div className={styles.warning}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Link expires even if never opened</span>
        </div>
      </div>

      <Link href="/" className={styles.createAnother}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Create another secret
      </Link>
    </div>
  );
}
