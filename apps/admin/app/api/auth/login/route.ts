import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('=== ADMIN LOGIN START ===');
  
  try {
    const { email, password } = await req.json();
    console.log('Email received:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL ?? 'https://juxtravelapp.onrender.com/api/v1';
    console.log('Backend URL:', backendUrl);

    const backendResponse = await fetch(`${backendUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    console.log('Backend status:', backendResponse.status);

    const rawResponse = await backendResponse.json();
    console.log('Raw backend response:', JSON.stringify(rawResponse).substring(0, 200));

    // Backend wraps response: { success, data: { token, admin }, message }
    // Extract actual data
    const data = rawResponse.data ?? rawResponse;

    console.log('Extracted data keys:', Object.keys(data));
    console.log('Has token:', !!data.token);

    if (!backendResponse.ok || !data.token) {
      console.log('Login failed - no token or bad response');
      return NextResponse.json(
        { error: rawResponse.message ?? 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Login success - setting cookie');

    // Create response
    const response = NextResponse.json({
      success: true,
      admin: data.admin,
    });

    // Set cookie via response.cookies (Next.js standard way)
    response.cookies.set({
      name: 'admin_token',
      value: data.token,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    console.log('=== ADMIN LOGIN END ===');
    return response;

  } catch (error: any) {
    console.error('=== LOGIN ERROR ===', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}

