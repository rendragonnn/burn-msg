export const EXPIRY_OPTIONS = [
  { label: '1 hour', value: '1h', ms: 60 * 60 * 1000 },
  { label: '24 hours', value: '24h', ms: 24 * 60 * 60 * 1000 },
  { label: '7 days', value: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
];

export const BURN_TIME_OPTIONS = [
  { label: '10 seconds', value: 10 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '3 minutes', value: 180 },
  { label: '5 minutes', value: 300 },
  { label: 'No auto-burn', value: 0 },
];

export const MAX_MESSAGE_LENGTH = 10000;
// 3MB file limit (before base64 encoding). Base64 adds ~33% overhead.
export const MAX_FILE_SIZE = 3 * 1024 * 1024; 
export const MAX_PAYLOAD_SIZE = 4.5 * 1024 * 1024; // 4.5MB total string size
export const ID_LENGTH = 12;
