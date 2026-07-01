import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createMessage } from '@/lib/store';
import { EXPIRY_OPTIONS, ID_LENGTH, MAX_PAYLOAD_SIZE } from '@/lib/constants';
import { rateLimit } from '@/lib/rateLimit';

// Validation helpers
const isValidBase64 = (str) => /^[A-Za-z0-9+/]+=*$/.test(str);
const isValidHex32 = (str) => /^[0-9a-f]{32}$/.test(str);
const isNumericString = (str) => /^\d+$/.test(str);

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const { allowed, retryAfter } = await rateLimit(ip, 20, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const { ciphertext, iv, passwordHash, expiresIn, burnTime, maxReads, audio, telegramId } = body;

    if (!ciphertext || !iv) {
      return NextResponse.json(
        { error: 'Missing required fields: ciphertext, iv' },
        { status: 400 }
      );
    }

    if (ciphertext.length > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413 }
      );
    }

    // Validate ciphertext and iv are valid base64
    if (!isValidBase64(ciphertext) || !isValidBase64(iv)) {
      return NextResponse.json(
        { error: 'Invalid ciphertext or iv format (must be base64)' },
        { status: 400 }
      );
    }

    // Validate passwordSalt — must be 32-char hex string or absent
    const passwordSalt = body.passwordSalt || null;
    if (passwordSalt && !isValidHex32(passwordSalt)) {
      return NextResponse.json(
        { error: 'Invalid passwordSalt format' },
        { status: 400 }
      );
    }

    // Validate telegramId — must be numeric string or absent
    const validatedTelegramId = telegramId ? String(telegramId).trim() : null;
    if (validatedTelegramId && !isNumericString(validatedTelegramId)) {
      return NextResponse.json(
        { error: 'Invalid telegramId format' },
        { status: 400 }
      );
    }

    // Validate expiresIn — support presets and custom (in seconds)
    const expiryOption = EXPIRY_OPTIONS.find(o => o.value === expiresIn);
    let expiryMs;
    if (expiryOption) {
      expiryMs = expiryOption.ms;
    } else {
      // Custom expiry: expect seconds, min 60s, max 30 days
      const customSec = parseInt(expiresIn, 10);
      if (isNaN(customSec) || customSec < 60 || customSec > 30 * 24 * 60 * 60) {
        return NextResponse.json(
          { error: 'Invalid expiry. Must be 60s to 30 days.' },
          { status: 400 }
        );
      }
      expiryMs = customSec * 1000;
    }

    // Validate burnTime — accept any number 0-3600
    const parsedBurnTime = typeof burnTime === 'number' ? burnTime : parseInt(burnTime, 10);
    const finalBurnTime = (!isNaN(parsedBurnTime) && parsedBurnTime >= 0 && parsedBurnTime <= 3600) ? parsedBurnTime : 30;

    // Validate maxReads - accept any number 1-1000
    const parsedMaxReads = typeof maxReads === 'number' ? maxReads : parseInt(maxReads, 10);
    const finalMaxReads = (!isNaN(parsedMaxReads) && parsedMaxReads >= 1 && parsedMaxReads <= 1000) ? parsedMaxReads : 1;

    const id = nanoid(ID_LENGTH);
    const expiresAt = Date.now() + expiryMs;

    await createMessage({
      id,
      ciphertext,
      iv,
      hasPassword: !!passwordHash,
      passwordHash: passwordHash || null,
      passwordSalt,
      expiresAt,
      burnTime: finalBurnTime,
      maxReads: finalMaxReads,
      audio: audio || null,
      telegramId: validatedTelegramId
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/messages] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
