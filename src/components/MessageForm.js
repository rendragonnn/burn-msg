'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateKey, encrypt } from '@/lib/crypto';
import { EXPIRY_OPTIONS, BURN_TIME_OPTIONS, MAX_MESSAGE_LENGTH, MAX_FILE_SIZE } from '@/lib/constants';
import styles from './MessageForm.module.css';

export default function MessageForm() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [telegramId, setTelegramId] = useState('');
  const [showTelegram, setShowTelegram] = useState(false);
  const [expiresIn, setExpiresIn] = useState('24h');
  const [customExpiry, setCustomExpiry] = useState('');
  const [customExpiryUnit, setCustomExpiryUnit] = useState('m');
  const [burnTime, setBurnTime] = useState(30);
  const [customBurn, setCustomBurn] = useState('');
  const [customBurnUnit, setCustomBurnUnit] = useState('s');
  const [maxReads, setMaxReads] = useState(1);
  const [customMaxReads, setCustomMaxReads] = useState('');
  const [file, setFile] = useState(null);
  const [allowDownload, setAllowDownload] = useState(false);
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audio, setAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recordingTimeRef = useRef(0);

  // KILL SWITCH: Force close microphone hardware channel & timers when user navigates away
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
        const duration = recordingTimeRef.current;
        
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > MAX_FILE_SIZE) {
          setFileError('Voice memo exceeds 3 MB limit');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          setAudio({
            name: `Voice Memo (${duration}s).${ext}`,
            type: mimeType,
            data: event.target.result,
            size: audioBlob.size,
            duration
          });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimeRef.current = 0;
      setFile(null); // Mutually exclusive
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const next = prev + 1;
          recordingTimeRef.current = next;
          if (next > 120) {
            stopRecording();
            return 120;
          }
          return next;
        });
      }, 1000);

    } catch (err) {
      setFileError('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) {
      setFile(null);
      setFileError('');
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError('File size must be less than 3 MB');
      setFile(null);
      e.target.value = '';
      return;
    }
    setFileError('');
    setAudio(null);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setFile({
        name: selected.name,
        type: selected.type,
        data: event.target.result,
        size: selected.size
      });
    };
    reader.readAsDataURL(selected);
  }

  async function hashPassword(pwd) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    const encoded = new TextEncoder().encode(saltHex + pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return { passwordHash, passwordSalt: saltHex };
  }

  function getExpiryValue() {
    if (expiresIn !== 'custom') return expiresIn;
    const val = parseInt(customExpiry, 10);
    if (isNaN(val) || val <= 0) return '24h';
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return String(val * (multipliers[customExpiryUnit] || 60));
  }

  function getBurnValue() {
    if (burnTime !== -1) return burnTime;
    const val = parseInt(customBurn, 10);
    if (isNaN(val) || val <= 0) return 30;
    const multipliers = { s: 1, m: 60 };
    return val * (multipliers[customBurnUnit] || 1);
  }

  function getMaxReadsValue() {
    if (maxReads !== -1) return maxReads;
    const val = parseInt(customMaxReads, 10);
    if (isNaN(val) || val <= 0) return 1;
    return val;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim() && !file) return;

    setLoading(true);
    setError('');

    try {
      const payloadString = JSON.stringify({
        _v: 2,
        text: message.trim(),
        file: file ? { ...file, allowDownload } : null,
        audio: audio
      });

      const key = await generateKey();
      const { ciphertext, iv } = await encrypt(payloadString, key);

      let passwordHash = null;
      let passwordSalt = null;
      if (showPassword && password.trim()) {
        const result = await hashPassword(password);
        passwordHash = result.passwordHash;
        passwordSalt = result.passwordSalt;
      }

      const finalExpiry = getExpiryValue();
      const finalBurn = getBurnValue();
      const finalMaxReadsValue = getMaxReadsValue();

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ciphertext, 
          iv, 
          passwordHash, 
          passwordSalt,
          expiresIn: finalExpiry, 
          burnTime: finalBurn, 
          maxReads: finalMaxReadsValue,
          telegramId: (showTelegram && telegramId.trim()) ? telegramId.trim() : null
        }),
      });

      if (!res.ok) {
        let errMsg = `HTTP ${res.status}`;
        try {
          const data = await res.clone().json();
          errMsg = data.error || data.stack || errMsg;
        } catch {
          const text = await res.clone().text();
          errMsg = text || errMsg;
        }
        throw new Error(errMsg);
      }

      const { id } = await res.json();
      router.push(`/created/${id}#${key}`);
    } catch (err) {
      console.error('[CreateMsg]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>
          Your Secret Message
        </label>
        <textarea
          id="message"
          className={styles.textarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your secret message or upload a file..."
          maxLength={MAX_MESSAGE_LENGTH}
          rows={6}
          disabled={loading}
        />
        <span className={styles.charCount}>
          {message.length} / {MAX_MESSAGE_LENGTH}
        </span>
      </div>

      <div className={styles.fileField}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="file-upload" className={styles.fileUploadBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
              {file ? 'Change Attachment' : 'Add Attachment (Max 3MB)'}
            </label>
            <input 
              id="file-upload" 
              type="file" 
              className={styles.fileInput} 
              onChange={handleFileChange}
              disabled={loading || isRecording}
            />
          </div>
          <button
            type="button"
            className={`${styles.fileUploadBtn} ${isRecording ? styles.recordingActive : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading}
            style={isRecording ? { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: '#ef4444' } : {}}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isRecording ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
            {isRecording ? `Stop (${recordingTime}s)` : 'Record Voice'}
          </button>
        </div>
        {file && (
          <div className={styles.filePreview}>
            <div className={styles.filePreviewInner}>
              <span className={styles.fileName}>{file.name}</span>
              <button 
                type="button" 
                className={styles.fileRemove} 
                onClick={() => setFile(null)}
                disabled={loading}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <label className={styles.allowDownloadCheckbox}>
              <input 
                type="checkbox" 
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
                disabled={loading}
              />
              <span>Allow recipient to download</span>
            </label>
          </div>
        )}
        {audio && !isRecording && (
          <div className={styles.filePreview}>
            <div className={styles.filePreviewInner}>
              <span className={styles.fileName}>{audio.name}</span>
              <button 
                type="button" 
                className={styles.fileRemove} 
                onClick={() => setAudio(null)}
                disabled={loading}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <audio controls src={audio.data} style={{ width: '100%', marginTop: '10px' }} />
          </div>
        )}
        {fileError && <p className={styles.error}>{fileError}</p>}
      </div>

      <div className={styles.optionsGrid}>
        <div className={styles.field}>
          <label htmlFor="expiry" className={styles.label}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Link expires after
          </label>
          <select
            id="expiry"
            className={styles.select}
            value={expiresIn}
            onChange={(e) => setExpiresIn(e.target.value)}
            disabled={loading}
          >
            {EXPIRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            <option value="custom">Custom...</option>
          </select>
          {expiresIn === 'custom' ? (
            <div className={styles.customInput}>
              <input
                type="number"
                min="1"
                className={styles.customNumber}
                value={customExpiry}
                onChange={(e) => setCustomExpiry(e.target.value)}
                placeholder="e.g. 15"
                disabled={loading}
              />
              <select
                className={styles.customUnit}
                value={customExpiryUnit}
                onChange={(e) => setCustomExpiryUnit(e.target.value)}
                disabled={loading}
              >
                <option value="m">minutes</option>
                <option value="h">hours</option>
                <option value="d">days</option>
              </select>
            </div>
          ) : (
            <span className={styles.hint}>How long the link stays active</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="burnTime" className={styles.label}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
            Reading time
          </label>
          <select
            id="burnTime"
            className={styles.select}
            value={burnTime}
            onChange={(e) => setBurnTime(Number(e.target.value))}
            disabled={loading}
          >
            {BURN_TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            <option value={-1}>Custom...</option>
          </select>
          {burnTime === -1 ? (
            <div className={styles.customInput}>
              <input
                type="number"
                min="1"
                className={styles.customNumber}
                value={customBurn}
                onChange={(e) => setCustomBurn(e.target.value)}
                placeholder="e.g. 45"
                disabled={loading}
              />
              <select
                className={styles.customUnit}
                value={customBurnUnit}
                onChange={(e) => setCustomBurnUnit(e.target.value)}
                disabled={loading}
              >
                <option value="s">seconds</option>
                <option value="m">minutes</option>
              </select>
            </div>
          ) : (
            <span className={styles.hint}>Time to read before auto-burn</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="maxReads" className={styles.label}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Reader Quota
          </label>
          <select
            id="maxReads"
            className={styles.select}
            value={maxReads}
            onChange={(e) => setMaxReads(Number(e.target.value))}
            disabled={loading}
          >
            <option value={1}>1 person (Standard)</option>
            <option value={2}>2 people</option>
            <option value={5}>5 people</option>
            <option value={10}>10 people</option>
            <option value={20}>20 people</option>
            <option value={50}>50 people</option>
            <option value={100}>100 people</option>
            <option value={-1}>Custom...</option>
          </select>
          {maxReads === -1 ? (
            <div className={styles.customInput}>
              <input
                type="number"
                min="1"
                max="1000"
                className={styles.customNumber}
                value={customMaxReads}
                onChange={(e) => setCustomMaxReads(e.target.value)}
                placeholder="e.g. 500"
                disabled={loading}
                style={{ width: '100%' }}
              />
            </div>
          ) : (
            <span className={styles.hint}>How many people can read this message</span>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <button
          type="button"
          className={`${styles.togglePassword} ${showPassword ? styles.toggleActive : ''}`}
          onClick={() => setShowPassword(!showPassword)}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          {showPassword ? 'Remove password' : 'Add password'}
        </button>
        {!showPassword && (
          <span className={styles.hint} style={{ marginTop: '8px', display: 'block' }}>Require a secret password to decrypt this message</span>
        )}
      </div>

      {showPassword && (
        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Recipient must enter this password"
            disabled={loading}
          />
        </div>
      )}

      <div className={styles.field} style={{ marginTop: '10px' }}>
        <button
          type="button"
          className={`${styles.togglePassword} ${showTelegram ? styles.toggleActive : ''}`}
          onClick={() => setShowTelegram(!showTelegram)}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13"/>
            <path d="m22 2-7 20-4-9-9-4Z"/>
          </svg>
          {showTelegram ? 'Remove Telegram Notif' : 'Add Telegram Notif'}
        </button>
        {!showTelegram && (
          <span className={styles.hint} style={{ marginTop: '8px', display: 'block' }}>Get an instant ping when target opens your message</span>
        )}
      </div>

      {showTelegram && (
        <div className={styles.field}>
          <label htmlFor="telegramId" className={styles.label}>
            Telegram Chat ID
          </label>
          <input
            id="telegramId"
            type="text"
            className={styles.input}
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            placeholder="Get your ID via @userinfobot"
            disabled={loading}
          />
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.submit} disabled={loading || (!message.trim() && !file)}>
        {loading ? (
          <span className={styles.spinner} />
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
            Create Burn Link
          </>
        )}
      </button>
    </form>
  );
}
