import { NextResponse } from 'next/server';

/**
 * Validates the API key from the Authorization header.
 * If API_SECRET is not set (development/unconfigured), all requests are allowed.
 * When set, requests must include "Authorization: ******".
 */
export function authenticate(request: Request): NextResponse | null {
  const apiSecret = process.env.API_SECRET;

  // If no secret is configured, skip authentication (open mode)
  if (!apiSecret) return null;

  const authHeader = request.headers.get('authorization');
  const expected = 'Bearer ' + apiSecret;
  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
