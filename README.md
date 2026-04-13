# BurnMsg

> Send encrypted messages, voice memos, and files that burn after being read.

BurnMsg is an advanced zero-knowledge encrypted messaging platform. Text, files, and audio are encrypted in your browser using **AES-256-GCM** before being sent to the server. The encryption key lives only in the URL fragment — **the server never sees your content**.

![BurnMsg](https://img.shields.io/badge/Encryption-AES--256--GCM-red) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **End-to-End Encryption** — AES-256-GCM via Web Crypto API
- **Zero-Knowledge Architecture** — Server stores only encrypted blobs
- **Encrypted Voice Memos** — Record and encrypt secure audio messages up to 120s directly in the browser
- **Secure File Attachments** — Attach encrypted files/images (up to 3MB) with cinematic zoom/pan previewing and anti-download protection
- **Scarcity Group Drops (Reader Quota)** — Let messages be read by 1 person, 50 people, or 1000 people before permanent destruction
- **One-Time Read / Auto-Burn** — Data is permanently destroyed upon hitting read limits or TTL
- **Custom Burn Timers** — Wait 10s, 30s, or custom durations before the payload self-destructs dynamically
- **Serverless Architecture** — Out-of-the-box support for Vercel KV / Upstash Redis for high-speed edge distribution

## 🔒 How It Works

```
You type message/audio → Browser encrypts (AES-256-GCM) → Encrypted blob → Redis Server
                           ↓
                  Random key → URL fragment (#key)
                           ↓
      Share link → Recipient opens → Browser decrypts → Message BURNED 🔥
```

1. You type your secret message, attach a file, or record a voice memo
2. Your browser encrypts everything with a random AES-256 key
3. The encrypted blob goes to the server; the key goes in the URL `#fragment`
4. Share the link — **the key never touches the server**
5. Recipient opens the link → browser decrypts → message is permanently burned

## 🛡️ Security Boundaries

- **Client-Side Encryption**: All encryption/decryption happens in your browser
- **URL Fragment Key**: The `#key` in the URL is never sent to the server (per HTTP spec)
- **Zero-knowledge**: Upstash Redis server only stores encrypted data it cannot read
- **Auto-Expiry**: Messages are automatically garbage collected by Redis TTL
- **One-time Read**: Message is destroyed immediately upon viewing (or reaching quota limit)

## 🏗️ Tech Stack

- **Next.js 14+** — React framework with App Router
- **Upstash Redis / Vercel KV** — Global serverless NoSQL database
- **Web Crypto API** — Native AES-256-GCM encryption
- **Vanilla CSS** — Custom design tokens, brutalist minimalism, no frameworks
- **nanoid** — Unique ID generation

## 📁 Project Structure

```
src/
├── app/
│   ├── api/messages/     # API routes (create, read, verify, KV integration)
│   ├── created/[id]/     # Link generated page
│   ├── msg/[id]/         # Decryption and payload reveal routing
│   ├── globals.css       # Design system tokens and layout styling
│   └── page.js           # Home page
├── components/
│   ├── BurnAnimation.js  # Typing reveal + countdown + WebGL burn effect
│   ├── CopyButton.js     # Clipboard utilities
│   ├── MessageForm.js    # Encryption layer, Audio recording, File processing
│   └── PasswordGate.js   # Password verification wall
└── lib/
    ├── constants.js      # Global limits and configurations
    ├── crypto.js         # AES-256-GCM encryption architecture
    └── store.js          # Upstash Redis data-layer integration
```

## 📄 License

MIT
