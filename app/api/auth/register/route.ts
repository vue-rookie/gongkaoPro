import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, password, phoneNumber } = await req.json();

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ message: '用户名已存在' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user with default session
    const defaultSessionId = uuidv4();
    const newUser = await User.create({
      username,
      password: hashedPassword,
      phoneNumber,
      createdAt: Date.now(),
      data: {
        messages: [],
        categories: [],
        sessions: [{ id: defaultSessionId, title: '新对话', updatedAt: Date.now() }],
        currentSessionId: defaultSessionId,
        currentMode: 'XING_CE'
      }
    });

    const userObj = newUser.toObject();
    delete userObj.password;
    delete userObj.data; // Don't send data on register, just user info

    return NextResponse.json({ 
        user: { ...userObj, id: userObj._id.toString() },
        message: '注册成功' 
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message || '注册失败' }, { status: 500 });
  }
}