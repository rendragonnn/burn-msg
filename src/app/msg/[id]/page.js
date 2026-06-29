'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { decrypt } from '@/lib/crypto';
import BurnAnimation from '@/components/BurnAnimation';
import PasswordGate from '@/components/PasswordGate';
import Link from 'next/link';
import styles from './page.module.css';

export default function ReadMessage() {
  const params = useParams();
  const [state, setState] = useState('loading');
  const [plaintext, setPlaintext] = useState('');
  const [file, setFile] = useState(null);
  const [burnTime, setBurnTime] = useState(30);
  const [maxReads, setMaxReads] = useState(1);
  const [currentRead, setCurrentRead] = useState(1);
  const [audio, setAudio] = useState(null);
  const [error, setError] = useState('');

  const decryptAndReveal = useCallback(async (data) => {
    try {
      const key = window.location.hash.slice(1);
      if (!key) {
        setState('gone');
        setError('Missing decryption key in URL.');
        return;
      }
      const decrypted = await decrypt(data.ciphertext, data.iv, key);
      let parsedText = decrypted;
      let parsedFile = null;
      let parsedAudio = null;
      try {
        const payload = JSON.parse(decrypted);
        if (payload._v === 2) {
          parsedText = payload.text;
          parsedFile = payload.file;
          if (payload.audio) parsedAudio = payload.audio;
        }
      } catch (e) {
        // Fallback to raw string
      }
      setPlaintext(parsedText);
      setFile(parsedFile);
      setAudio(parsedAudio || data.audio || null);
      setBurnTime(data.burnTime ?? 30);
      setCurrentRead(data.currentRead || 1);
      setMaxReads(data.maxReads || 1);
      setState('revealed');
    } catch {
      setState('gone');
      setError('Failed to decrypt message. The link may be invalid.');
    }
  }, []);

  useEffect(() => {
    async function fetchMessage() {
      try {
        const res = await fetch(`/api/messages/${params.id}`);
        if (!res.ok) {
          if (res.status === 410 || res.status === 404) {
            try {
              const dataText = await res.text();
              const parsed = JSON.parse(dataText);
              if (parsed.error) setError(parsed.error);
            } catch {}
            setState('gone');
          } else {
            setState('gone');
            setError('Failed to load message.');
          }
          return;
        }
        const data = await res.json();
        if (data.hasPassword) {
          setState('password');
          return;
        }
        await decryptAndReveal(data);
      } catch {
        setState('gone');
        setError('Failed to load message.');
      }
    }
    fetchMessage();
  }, [params.id, decryptAndReveal]);

  if (state === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinnerRing}>
            <div className={styles.spinner} />
          </div>
          <p className={styles.loadingLabel}>Retrieving encrypted message...</p>
          <div className={styles.loadingSteps}>
            <span className={styles.loadingStep}>Connecting</span>
            <span className={styles.loadingDot}>→</span>
            <span className={styles.loadingStep}>Fetching</span>
            <span className={styles.loadingDot}>→</span>
            <span className={`${styles.loadingStep} ${styles.loadingStepPending}`}>Decrypting</span>
          </div>
        </div>
      </div>
    );
  }

  const [passwordSalt, setPasswordSalt] = useState(null);

  // passwordSalt is extracted from the GET response when hasPassword=true
  useEffect(() => {
    if (state === 'password') {
      fetch(`/api/messages/${params.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.passwordSalt) setPasswordSalt(data.passwordSalt);
        })
        .catch(() => {});
    }
  }, [state, params.id]);

  if (state === 'password') {
    return (
      <div className={styles.page}>
        <PasswordGate
          messageId={params.id}
          passwordSalt={passwordSalt}
          onUnlock={(data) => decryptAndReveal(data)}
          onGone={(errorMsg) => {
            setError(errorMsg);
            setState('gone');
          }}
        />
      </div>
    );
  }

  if (state === 'gone') {
    return (
      <div className={styles.page}>
        <div className={styles.gone}>
          <div className={styles.goneIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
            </svg>
          </div>
          <h1>Message Destroyed</h1>
          <p>{error || 'This message has already been read and permanently destroyed.'}</p>
          <div className={styles.goneInfo}>
            <span>No copies exist anywhere — not on the server, not in any logs.</span>
          </div>
          <Link href="/" className={styles.homeLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Send your own secret
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.brandHeader}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.brandIcon}>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        </svg>
        <span className={styles.brandName}>BurnMsg</span>
      </div>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span className={styles.badge}>Encrypted Message</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.liveDot} />
          <span className={styles.liveLabel}>
            {maxReads > 1 ? `Reader #${currentRead} out of ${maxReads}` : 'One-time view'}
          </span>
        </div>
      </div>

      <BurnAnimation
        text={plaintext}
        file={file}
        audio={audio}
        burnTime={burnTime}
        onComplete={() => setState('destroyed')}
      />

      {state === 'destroyed' && (
        <div className={styles.afterBurn}>
          <Link href="/" className={styles.homeLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Send your own secret
          </Link>
        </div>
      )}
    </div>
  );
}
