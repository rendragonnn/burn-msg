'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import styles from './BurnAnimation.module.css';

function formatTime(seconds) {
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  return `${seconds}s`;
}

export default function BurnAnimation({ text, file, audio, burnTime = 30, onComplete }) {
  const [phase, setPhase] = useState('reveal');
  const [countdown, setCountdown] = useState(burnTime);
  const [textContent, setTextContent] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef(null);
  const noBurn = burnTime === 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleZoomReset = () => setZoom(100);

  useEffect(() => {
    if (file && (file.type.startsWith('text/') || file.type === 'application/json' || file.name.match(/\.(txt|md|csv|json|js|jsx|ts|tsx|py|html|css|log|rs|go|c|cpp|h|hpp)$/i))) {
      try {
        const base64 = file.data.split(',')[1];
        if (base64) {
          const binaryString = window.atob(base64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const decoded = new TextDecoder().decode(bytes);
          setTextContent(decoded);
        }
      } catch (e) {
        setTextContent("Preview not available for this file format.");
      }
    }

    if (file && file.data) {
      let isActive = true;
      let url = null;
      fetch(file.data)
        .then(res => res.blob())
        .then(blob => {
          if (!isActive) return;
          url = URL.createObjectURL(blob);
          setBlobUrl(url);
        })
        .catch(console.error);
        
      return () => {
        isActive = false;
        if (url) URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  useEffect(() => {
    // Prevent Save (Ctrl+S) and Print (Ctrl+P) when download is not allowed
    if (file && !file.allowDownload) {
      const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
          e.preventDefault();
        }
      };
      // Prevent global generic context menu optionally
      const disableContextMenu = (e) => e.preventDefault();
      
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('contextmenu', disableContextMenu);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('contextmenu', disableContextMenu);
      };
    }
  }, [file]);

  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  // Immediately show full text, then start countdown
  useEffect(() => {
    if (phase !== 'reveal') return;
    if (noBurn) return; // No auto-burn, just show the message

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('glitching');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, noBurn]);

  // Phase 2: Glitch
  useEffect(() => {
    if (phase !== 'glitching') return;
    const timer = setTimeout(() => setPhase('burning'), 1000);
    return () => clearTimeout(timer);
  }, [phase]);

  // Phase 3: Burning
  useEffect(() => {
    if (phase !== 'burning') return;
    const timer = setTimeout(() => {
      setPhase('destroyed');
      handleComplete();
    }, 1500);
    return () => clearTimeout(timer);
  }, [phase, handleComplete]);

  // Manual burn for "no auto-burn" mode
  function handleManualBurn() {
    setPhase('glitching');
  }

  if (phase === 'destroyed') {
    return (
      <div className={styles.destroyed}>
        <div className={styles.destroyedIcon}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>
        </div>
        <h2 className={styles.destroyedTitle}>Message Burned</h2>
        <p>This message has been permanently destroyed.<br />No copies exist anywhere.</p>
        <div className={styles.ashes}>
          {[...Array(8)].map((_, i) => (
            <span key={i} className={styles.ash} style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  const containerClass = [
    styles.container,
    phase === 'glitching' ? styles.glitching : '',
    phase === 'burning' ? styles.burning : '',
  ].filter(Boolean).join(' ');

  const canZoom = file && (
    file.type.startsWith('image/') || 
    file.type === 'application/pdf' || 
    textContent !== null
  );

  const contentClass = styles.contentWrapper;

  return (
    <div className={containerClass}>

      <div className={contentClass}>
        {text && (
          <pre className={styles.text} data-text={text}>
            {text}
          </pre>
        )}

      {file && (
        <div className={styles.attachment}>
          <div className={styles.attachmentHeader}>
            <div className={styles.headerTitle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
              {file.name}
            </div>
            <div className={styles.headerRight}>
              <span className={styles.headerSize}>{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
          
          {canZoom && (
            <div className={styles.zoomBar}>
              <div className={styles.zoomControls}>
                <button onClick={handleZoomOut} className={styles.zoomBtn}>-</button>
                <span className={styles.zoomLabel} title="Current Zoom">{zoom}%</span>
                <button onClick={handleZoomIn} className={styles.zoomBtn}>+</button>
                {zoom !== 100 && (
                  <button onClick={handleZoomReset} className={styles.zoomTextBtn}>
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}

          {file.type.startsWith('image/') ? (
             <div className={styles.mediaContainerScrollable}>
               <img 
                 src={blobUrl || file.data} 
                 alt={file.name} 
                 className={styles.attachmentImageZoomable} 
                 style={{ width: `${zoom}%` }}
                 onContextMenu={!file.allowDownload ? (e) => e.preventDefault() : undefined}
                 draggable={file.allowDownload}
               />
             </div>
          ) : file.type.startsWith('audio/') ? (
            <audio 
              controls 
              src={blobUrl || file.data} 
              className={styles.attachmentAudio} 
              controlsList={!file.allowDownload ? "nodownload" : undefined}
              onContextMenu={!file.allowDownload ? (e) => e.preventDefault() : undefined}
            />
          ) : file.type.startsWith('video/') ? (
            <div className={styles.mediaContainerScrollable}>
              <video 
                controls 
                src={blobUrl || file.data} 
                className={styles.attachmentVideo} 
                controlsList={!file.allowDownload ? "nodownload" : undefined}
                onContextMenu={!file.allowDownload ? (e) => e.preventDefault() : undefined}
              />
            </div>
          ) : textContent !== null ? (
            <div className={styles.mediaContainerScrollableText}>
              <pre 
                className={styles.textPreviewContent} 
                style={{ fontSize: `${0.8125 * (zoom / 100)}rem` }} 
                onContextMenu={!file.allowDownload ? (e) => e.preventDefault() : undefined}
              >
                {textContent}
              </pre>
            </div>
          ) : file.type === 'application/pdf' ? (
            <div className={styles.mediaContainerScrollablePdf}>
              {blobUrl ? (
                <div className={styles.protectedPdfWrapper} style={{ width: `${zoom}%`, height: `${500 * (zoom/100)}px`, minHeight: '500px' }}>
                  <iframe src={`${blobUrl}#toolbar=0&navpanes=0`} title={file.name} className={styles.attachmentPdfFixed} frameBorder="0" />
                  {!file.allowDownload && (
                    <div className={styles.pdfProtector} onContextMenu={(e) => e.preventDefault()} title="Protected Preview — Right click disabled" />
                  )}
                </div>
              ) : (
                <div className={styles.pdfLoading}>Preparing preview...</div>
              )}
            </div>
          ) : (
            <div className={styles.attachmentGeneric}>
               <div className={styles.genericLeft}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                   <polyline points="14 2 14 8 20 8" />
                 </svg>
                 <div className={styles.genericInfo}>
                   <span className={styles.genericName}>{file.name}</span>
                   <span className={styles.genericSize}>{(file.size / 1024).toFixed(1)} KB</span>
                 </div>
               </div>
            </div>
          )}

          <div className={styles.attachmentFooter}>
            {file.allowDownload ? (
              <a href={blobUrl || file.data} download={file.name} className={styles.downloadBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download File
              </a>
            ) : (
              <div className={styles.disabledBtn} title="Sender disabled downloading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Protected — View Only
              </div>
            )}
          </div>
        </div>
      )}

      {audio && (
        <div className={styles.attachment}>
           <div className={styles.attachmentHeader}>
             <div className={styles.headerTitle}>
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                 <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                 <line x1="12" x2="12" y1="19" y2="22"/>
               </svg>
               Voice Memo
             </div>
           </div>
           <audio 
             ref={audioRef}
             controls 
             src={audio.data} 
             className={styles.attachmentAudio} 
             controlsList="nodownload noplaybackrate"
             onContextMenu={(e) => e.preventDefault()}
           />
        </div>
      )}

      {phase === 'reveal' && !noBurn && (
        <div className={styles.countdownBar}>
          <div className={styles.countdownInfo}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
            <span>Self-destructing in</span>
          </div>
          <div className={styles.countdownNumber}>{formatTime(countdown)}</div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(countdown / burnTime) * 100}%` }}
            />
          </div>
        </div>
      )}

      {phase === 'reveal' && noBurn && (
        <div className={styles.manualBurn}>
          <div className={styles.noBurnInfo}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
            <span>Auto-burn is disabled. Destroy manually when ready.</span>
          </div>
          <button onClick={handleManualBurn} className={styles.burnButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
            Destroy Now
          </button>
        </div>
      )}

      {phase === 'glitching' && (
        <p className={styles.glitchText}>⚠ INITIATING DESTRUCTION SEQUENCE...</p>
      )}

      {phase === 'burning' && (
        <p className={styles.burningText}>
          <span className={styles.burnDot} />
          Destroying message...
        </p>
      )}
      </div>
    </div>
  );
}
