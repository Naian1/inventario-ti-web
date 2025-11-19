import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { theme } = body;

    if (theme !== 'light' && theme !== 'dark') {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set('inventoryTheme', theme, {
      path: '/',
      maxAge: 31536000, // 1 year
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
