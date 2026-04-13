/**
 * AES-256-GCM encryption/decryption using Web Crypto API.
 * Key is generated client-side and placed in URL fragment.
 * Server never sees the key or plaintext.
 */

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a random AES-256 key and return it as a base64url string.
 */
export async function generateKey() {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Import a base64url key string into a CryptoKey object.
 */
async function importKey(keyBase64url) {
  const base64 = keyBase64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const keyBuffer = base64ToArrayBuffer(base64);
  return crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext with AES-256-GCM.
 * Returns: { ciphertext: base64, iv: base64 }
 */
export async function encrypt(plaintext, keyBase64url) {
  const key = await importKey(keyBase64url);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  return {
    ciphertext: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
  };
}

/**
 * Decrypt ciphertext with AES-256-GCM.
 * Returns: plaintext string
 */
export async function decrypt(ciphertextBase64, ivBase64, keyBase64url) {
  const key = await importKey(keyBase64url);
  const ciphertext = base64ToArrayBuffer(ciphertextBase64);
  const iv = base64ToArrayBuffer(ivBase64);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}
