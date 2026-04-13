import { NextResponse } from 'next/server';
import { getMessage, claimMessageRead } from '@/lib/store';
import { sendTelegramNotification } from '@/lib/telegram';

export async function GET(request, { params }) {
  const { id } = await params;
  const msg = await getMessage(id);

  if (!msg) {
    return NextResponse.json(
      { error: 'Message not found or already destroyed' },
      { status: 404 }
    );
  }

  if (msg.burned) {
    const peopleStr = msg.maxReads === 1 ? '1 person' : `${msg.maxReads} people`;
    return NextResponse.json(
      { error: `Too late, the message was already burned by ${peopleStr}` },
      { status: 410 }
    );
  }

  if (msg.hasPassword) {
    return NextResponse.json({
      hasPassword: true,
      createdAt: msg.createdAt,
    });
  }

  const response = {
    ciphertext: msg.ciphertext,
    iv: msg.iv,
    audio: msg.audio || null,
    burnTime: msg.burnTime ?? 30,
    createdAt: msg.createdAt,
  };

  const currentReadCount = await claimMessageRead(id, msg.maxReads);
  
  if (currentReadCount === null) {
    const peopleStr = msg.maxReads === 1 ? '1 person' : `${msg.maxReads} people`;
    return NextResponse.json(
      { error: `Too late, the message was already burned by ${peopleStr}` },
      { status: 410 }
    );
  }

  response.currentRead = currentReadCount;
  response.maxReads = msg.maxReads;


  if (msg.telegramId) {
    await sendTelegramNotification(msg.telegramId, request, id);
  }

  return NextResponse.json(response);
}
