import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createMessage } from '@/lib/store';
import { EXPIRY_OPTIONS, BURN_TIME_OPTIONS, ID_LENGTH, MAX_PAYLOAD_SIZE } from '@/lib/constants';

export async function POST(request) {
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
      expiresAt,
      burnTime: finalBurnTime,
      maxReads: finalMaxReads,
      audio: audio || null,
      telegramId: telegramId || null
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
