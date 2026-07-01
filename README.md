# BurnMsg

Zero-knowledge, ephemeral messaging platform. Text, voice memos, and files are encrypted client-side using AES-256-GCM before transmission. Decryption keys are confined to the URL hash fragment and never reach the network or server.

---

## Cryptographic Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Sender as Sender (Browser)
    participant Edge as Next.js Edge (Server)
    participant DB as Upstash Redis (Database)
    actor Recipient as Recipient (Browser)

    Note over Sender: 1. Generate AES-256 Key (Local)<br/>2. Encrypt Payload (AES-256-GCM)<br/>3. Hash Password (PBKDF2, 100k iter)
    Sender->>Edge: POST /api/messages (ciphertext, IV, salt, passwordHash)
    Note over Edge: Validate base64/hex formats
    Edge->>DB: HSET msg:id + EXPIRE (TTL)
    Note over Sender: Decryption Key stored in URL Hash (#key)
    Sender->>Recipient: Share URL: burnmsg.com/msg/id#key
    
    Recipient->>Edge: GET /api/messages/id
    Note over Edge: Atomic claim: HINCRBY reads 1<br/>Check reads <= maxReads<br/>If reads == maxReads -> wipe ciphertext
    Edge->>Recipient: Return Ciphertext + IV (if claim succeeded)
    Note over Recipient: Decrypt Payload in-browser using URL #key
```

### Technical Specifications
* **Encryption standard**: AES-256-GCM via native Web Crypto API.
* **Key Generation**: Cryptographically secure pseudo-random number generator (`crypto.getRandomValues()`).
* **Zero-Knowledge Boundary**: The decryption key is passed via the URL hash fragment (`#key`). Because browsers do not transmit hash fragments in HTTP requests, the key never touches the network or the server.
* **Password Hashing**: PBKDF2 with 100,000 iterations using HMAC-SHA-256, computed entirely client-side.
* **Timing-Attack Protection**: Backend comparisons of verification hashes use constant-time comparison via Node's `crypto.timingSafeEqual` to eliminate side-channel timing leaks.
* **Race Condition Mitigation**: Message read tracking is executed via atomic Redis `HINCRBY` operations pipelined with `TTL` checks, removing Time-of-Check to Time-of-Use (TOCTOU) vulnerabilities.

---

## Technical Stack

* **Frontend & Routing**: Next.js 14+ (App Router)
* **Ephemeral Store**: Upstash Redis (Global Serverless Edge Distribution)
* **Crypto Subsystem**: Web Crypto API (Client-side)
* **Styling**: Vanilla CSS (Zero UI Frameworks, strict design system tokens)
* **Rate Limiting**: Pipelined distributed sliding-window rate limiter via Upstash Redis

---

## Security Hardening

* **Content Security Policy (CSP)**: Locked down with no `'unsafe-eval'` to eliminate XSS escalation vectors.
* **Strict Privacy Headers**: `Referrer-Policy: no-referrer` prevents leakage of message IDs through third-party links.
* **No CDN Tracking**: Zero external CDNs or Google Font API calls. Fonts are self-hosted via `next/font` to protect user IPs.
* **Brute-Force Lockout**: Automatic payload destruction (wiping the ciphertext from Redis) after 5 consecutive incorrect password attempts.

---

## License

MIT
