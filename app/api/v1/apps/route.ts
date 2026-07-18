import { NextRequest, NextResponse } from 'next/server';

/**
 * Mastodon API: POST /api/v1/apps
 * Registers a client application. Mastodon clients use this to get OAuth credentials.
 */
export async function POST(req: NextRequest) {
  try {
    let clientName = 'Tusky';
    let redirectUris = 'urn:ietf:wg:oauth:2.0:oob';
    let scopes = 'read write follow';
    let website = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      clientName = body.client_name || clientName;
      redirectUris = body.redirect_uris || redirectUris;
      scopes = body.scopes || scopes;
      website = body.website || website;
    } else {
      // Handle URL encoded form data
      const formData = await req.formData();
      clientName = (formData.get('client_name') as string) || clientName;
      redirectUris = (formData.get('redirect_uris') as string) || redirectUris;
      scopes = (formData.get('scopes') as string) || scopes;
      website = (formData.get('website') as string) || website;
    }

    // Generate deterministic client id/secret based on name to be stateless and robust
    const encodedName = Buffer.from(clientName).toString('hex');
    const clientId = `ef_client_${encodedName}`;
    const clientSecret = `ef_secret_${encodedName}_${Date.now()}`;

    const appData = {
      id: 'engelsiz_app_1',
      name: clientName,
      website: website || null,
      redirect_uri: redirectUris,
      client_id: clientId,
      client_secret: clientSecret,
      vapid_key: 'BEl68Z664B1XzLCS78X9c83664a7810_887e_4664_78910_emulated_key'
    };

    return new NextResponse(JSON.stringify(appData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (err: any) {
    console.error('Apps API error:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
