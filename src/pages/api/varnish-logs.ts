import type { APIRoute } from 'astro';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const lines = url.searchParams.get('lines') || '50';
  const container = 'strapi-varnish-cache';

  try {
    const { stdout, stderr } = await execAsync(
      `docker logs --tail ${lines} ${container} 2>&1`
    );

    return new Response(JSON.stringify({
      logs: stdout || stderr || 'No logs available',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      error: 'Failed to fetch logs',
      details: errorMessage,
      logs: `Container '${container}' not running or not found.\nStart it with: cd packages/cms && docker compose up -d`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
