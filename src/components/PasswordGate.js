'use client';

import { useState } from 'react';
import styles from './PasswordGate.module.css';

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function arrayToHex(arr) {
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function PasswordGate({ messageId, passwordSalt, onUnlock, onGone }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function hashPassword(pwd) {
    const salt = passwordSalt || '';
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(pwd),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const saltBytes = hexToBytes(salt);
    const derived = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: saltBytes, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    return arrayToHex(new Uint8Array(derived));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const passwordHash = await hashPassword(password);
      const res = await fetch(`/api/messages/${messageId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordHash }),
      });

      if (!res.ok) {
        if (res.status === 403) {
          try {
            const data = await res.json();
            setError(data.error || 'Incorrect password. Try again.');
          } catch {
            setError('Incorrect password. Try again.');
          }
        } else if (res.status === 410 || res.status === 404) {
          try {
            const data = await res.json();
            if (onGone) onGone(data.error || 'This message has already been destroyed.');
            else setError(data.error || 'This message has already been destroyed.');
          } catch {
            if (onGone) onGone('This message has already been destroyed.');
            else setError('This message has already been destroyed.');
          }
        } else {
          setError('Something went wrong.');
        }
        return;
      }

      const data = await res.json();
      onUnlock(data);
    } catch {
      setError('Failed to verify password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <h2 className={styles.title}>Password Required</h2>
      <p className={styles.subtitle}>This message is password protected.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoFocus
          disabled={loading}
        />
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.submit} disabled={loading || !password.trim()}>
          {loading ? 'Verifying...' : 'Unlock Message'}
        </button>
      </form>
    </div>
  );
}
