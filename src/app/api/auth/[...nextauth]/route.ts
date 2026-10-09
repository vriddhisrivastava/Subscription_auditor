// Authentication handler route
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, action } = body;

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'signup' && (!password || password.length < 6)) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mockUser = {
      id: `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      name: email.split('@')[0],
      currency: 'USD',
      reminderDays: 3,
    };

    return new Response(
      JSON.stringify({
        user: mockUser,
        token: `mock_jwt_token_${Date.now()}`,
        message: action === 'signup' ? 'Account created successfully' : 'Logged in successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Authentication failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      authenticated: true,
      user: {
        id: 'usr_default_demo',
        email: 'alex.rivera@example.com',
        name: 'Alex Rivera',
        currency: 'USD',
        reminderDays: 3,
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
