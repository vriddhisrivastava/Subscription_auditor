// REST API: GET /api/audit - Runs audit engine on active subscriptions
import { db } from '../../../lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || undefined;
    const unusedDays = parseInt(url.searchParams.get('unusedDays') || '30', 10);
    const auditSummary = await db.runAudit(userId, unusedDays);
    return new Response(JSON.stringify(auditSummary), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Audit execution failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
