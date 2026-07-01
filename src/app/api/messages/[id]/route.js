import { NextResponse } from 'next/server';
import { getMessageMeta, claimMessageRead } from '@/lib/store';
import { sendTelegramNotification } from '@/lib/telegram';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(request, { params }) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const { allowed, retryAfter } = await rateLimit(ip, 30, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  const { id } = await params;

  // Step 1: Read metadata only (no ciphertext exposed yet)
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

  // If password-protected, return metadata only (no claim yet)
  if (meta.hasPassword) {
    return NextResponse.json({
      hasPassword: true,
      passwordSalt: meta.passwordSalt,
      createdAt: meta.createdAt,
    });
  }

  // Step 2: Atomic claim-first, read-second (fixes TOCTOU race condition)
  const result = await claimMessageRead(id);

  if (result === null) {
    const peopleStr = meta.maxReads === 1 ? '1 person' : `${meta.maxReads} people`;
    return NextResponse.json(
      { error: `Too late, the message was already burned by ${peopleStr}` },
      { status: 410 }
    );
  }

  // Step 3: Send notification (non-blocking, after successful claim)
  if (meta.telegramId) {
    sendTelegramNotification(meta.telegramId, request, id).catch(() => {});
  }

  return NextResponse.json(result);
}
