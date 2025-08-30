import { NextResponse } from 'next/server';
import { appendFile, readFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { parcel_id } = await request.json();
    if (!parcel_id || typeof parcel_id !== 'string') {
      return NextResponse.json({ error: 'parcel_id required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'db', 'saved-parcels.txt');
    await appendFile(filePath, `${parcel_id}\n`, { encoding: 'utf8' });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parcelId = searchParams.get('parcel_id');
    if (!parcelId) {
      return NextResponse.json({ error: 'parcel_id required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'db', 'saved-parcels.txt');
    let saved = false;
    try {
      const content = await readFile(filePath, { encoding: 'utf8' });
      const lines = content.split(/\r?\n/).filter(Boolean);
      saved = lines.includes(parcelId);
    } catch (e: any) {
      // If file doesn't exist yet, treat as not saved
      saved = false;
    }

    return NextResponse.json({ saved });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
