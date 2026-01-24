import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { userId, data } = await req.json();

    if (!userId || !data) {
      return NextResponse.json({ message: 'Missing data' }, { status: 400 });
    }

    (User.findByIdAndUpdate as any)(userId, {
      $set: { data: data }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ message: 'Sync failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ message: 'No User ID' }, { status: 400 });

        const user = await (User.findById as any)(userId);
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        return NextResponse.json(user.data || {});
    } catch (error) {
        return NextResponse.json({ message: 'Fetch failed' }, { status: 500 });
    }
}