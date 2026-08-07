import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL ?? 'https://juxtravelapp.onrender.com/api/v1';

    const backendResponse = await fetch(`${backendUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const rawResponse = await backendResponse.json();
    const data = rawResponse.data ?? rawResponse;

    if (!backendResponse.ok || !data.token) {
      return NextResponse.json(
        { error: rawResponse.message ?? 'Invalid credentials' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      admin: data.admin,
    });

    response.cookies.set({
      name: 'admin_token',
      value: data.token,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ADMIN_LOGIN] Error:', error?.message);
    }
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
