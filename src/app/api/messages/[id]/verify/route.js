import { NextResponse } from 'next/server';
import { getMessageMeta, getPasswordHash, claimMessageRead, recordFailedAttempt } from '@/lib/store';
import { sendTelegramNotification } from '@/lib/telegram';
import { rateLimit } from '@/lib/rateLimit';
import { timingSafeEqual as cryptoTimingSafeEqual } from 'crypto';

/**
 * Constant-time string comparison to prevent timing side-channel attacks.
 */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return cryptoTimingSafeEqual(bufA, bufB);
}

export async function POST(request, { params }) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const { allowed, retryAfter } = await rateLimit(ip, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  const { id } = await params;
  const meta = await getMessageMeta(id);

  if (!meta) {
    return NextResponse.json(
      { error: 'Message not found or already destroyed' },
      { status: 404 }
    );
  }

  if (meta.burned) {
    const peopleStr = meta.maxReads === 1 ? '1 person' : `${meta.maxReads} people`;
    return NextResponse.json(
      { error: `Too late, the message was already burned by ${peopleStr}` },
      { status: 410 }
    );
  }

  const body = await request.json();
  const { passwordHash } = body;

  if (!meta.hasPassword) {
    return NextResponse.json(
      { error: 'Message is not password protected' },
      { status: 400 }
    );
  }

  // Fetch password hash separately (not included in meta for defense in depth)
  const storedHash = await getPasswordHash(id);

  // Constant-time comparison to prevent timing side-channel attacks
  if (!storedHash || !timingSafeEqual(passwordHash, storedHash)) {
    // Record failed attempt — auto-burns after 5 failures
    const { burned, attemptsLeft } = await recordFailedAttempt(id);
    if (burned) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Message has been destroyed.' },
        { status: 410 }
      );
    }
    return NextResponse.json(
      { error: `Incorrect password. ${attemptsLeft} attempt(s) remaining.` },
      { status: 403 }
    );
  }

  // Password correct — atomic claim-first, read-second
  const result = await claimMessageRead(id);

  if (result === null) {
    const peopleStr = meta.maxReads === 1 ? '1 person' : `${meta.maxReads} people`;
    return NextResponse.json(
      { error: `Too late, the message was already burned by ${peopleStr}` },
      { status: 410 }
    );
  }

  // Send notification (non-blocking)
  if (meta.telegramId) {
    sendTelegramNotification(meta.telegramId, request, id).catch(() => {});
  }

  return NextResponse.json(result);
}
