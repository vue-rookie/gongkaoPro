import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, password } = await req.json();

    // Select password to verify, and data to load state
    const user = await User.findOne({ username } as any).select('+password');
    
    if (!user) {
      return NextResponse.json({ message: '用户名或密码错误' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: '用户名或密码错误' }, { status: 401 });
    }

    const userObj = user.toObject();
    delete userObj.password;

    // Return User Info AND their Data
    return NextResponse.json({
      user: {
         id: userObj._id.toString(),
         username: userObj.username,
         phoneNumber: userObj.phoneNumber,
         avatar: userObj.avatar,
         createdAt: userObj.createdAt
      },
      data: userObj.data // This loads the cloud state
    });

  } catch (error: any) {
    return NextResponse.json({ message: '登录失败' }, { status: 500 });
  }
}