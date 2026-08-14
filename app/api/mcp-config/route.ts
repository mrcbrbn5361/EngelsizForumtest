import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get('type') || 'opencode').toLowerCase();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.engelsizforum.com';
  const mcpUrl = `${baseUrl}/mcp`;

  let configData: any = {};
  let filename = 'opencode.json';

  switch (type) {
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
    case 'cursor.json':
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
            url: mcpUrl,
            type: 'sse',
          },
        },
      };
      break;

    case 'claude':
    case 'claude_desktop':
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
      filename = 'cline_mcp_settings.json';
      configData = {
        mcpServers: {
          engelsizforum: {
            url: mcpUrl,
            type: 'sse',
          },
        },
      };
      break;

    case 'roo':
    case 'roocode':
      filename = 'roo_code_mcp_settings.json';
      configData = {
        mcpServers: {
          engelsizforum: {
            url: mcpUrl,
            type: 'sse',
          },
        },
      };
      break;

    case 'codex':
      filename = 'config.json';
      configData = {
        mcp_servers: [
          {
            name: 'engelsizforum',
            url: mcpUrl,
            transport: 'sse',
          },
        ],
      };
      break;

    case 'goose':
      filename = 'config.yaml';
      configData = {
        extensions: {
          engelsizforum: {
            enabled: true,
            type: 'sse',
            url: mcpUrl,
          },
        },
      };
      break;

    case 'zed':
      filename = 'settings.json';
      configData = {
        experimental: {
          mcp_servers: {
            engelsizforum: {
              url: mcpUrl,
            },
          },
        },
      };
      break;

    case 'continue':
      filename = 'config.json';
      configData = {
        experimental: {
          modelContextProtocol: [
            {
              name: 'engelsizforum',
              url: mcpUrl,
            },
          ],
        },
      };
      break;

    case 'aider':
      filename = 'aider.json';
      configData = {
        mcp: {
          engelsizforum: {
            url: mcpUrl,
          },
        },
      };
      break;

    case 'vscode':
    case 'copilot':
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

    default:
      filename = `${type.replace(/[^a-z0-9]/g, '')}_mcp_config.json`;
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

