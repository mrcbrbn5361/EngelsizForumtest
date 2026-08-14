import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'opencode';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.engelsizforum.com';
  const mcpUrl = `${baseUrl}/mcp`;

  let configData: any = {};
  let filename = 'opencode.json';

  switch (type.toLowerCase()) {
    case 'opencode':
    case 'opencode.json':
      filename = 'opencode.json';
      configData = {
        $schema: 'https://opencode.ai/config.json',
        mcp: {
          engelsizforum: {
            type: 'remote',
            url: mcpUrl,
          },
        },
      };
      break;

    case 'cursor':
      filename = 'mcp.json';
      configData = {
        mcpServers: {
          engelsizforum: {
            url: mcpUrl,
            type: 'sse',
          },
        },
      };
      break;

    case 'windsurf':
      filename = 'mcp_config.json';
      configData = {
        mcpServers: {
          engelsizforum: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-fetch', mcpUrl],
          },
        },
      };
      break;

    case 'claude':
      filename = 'claude_desktop_config.json';
      configData = {
        mcpServers: {
          engelsizforum: {
            url: mcpUrl,
            type: 'sse',
          },
        },
      };
      break;

    case 'cline':
    case 'roo':
      filename = 'cline_mcp_settings.json';
      configData = {
        mcpServers: {
          engelsizforum: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-fetch', mcpUrl],
          },
        },
      };
      break;

    default:
      filename = 'mcp-servers.json';
      configData = {
        mcpServers: {
          engelsizforum: {
            url: mcpUrl,
            type: 'sse',
          },
        },
      };
      break;
  }

  return new NextResponse(JSON.stringify(configData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Access-Control-Allow-Origin': '*',
    },
  });
}
