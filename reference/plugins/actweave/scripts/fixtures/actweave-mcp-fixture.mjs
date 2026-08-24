import { McpServer } from '@modelcontextprotocol/server'
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio'
import { z } from 'zod'

const server = new McpServer({ name: 'actweave-fixture', version: '1.0.0' })

server.registerTool(
  'transform',
  {
    title: 'Transform fixture text',
    description: 'Return the supplied text in a deterministic envelope.',
    inputSchema: { text: z.string().min(1) },
    outputSchema: { result: z.string() },
  },
  async ({ text }) => {
    const result = `fixture:${text}`
    return {
      content: [{ type: 'text', text: result }],
      structuredContent: { result },
    }
  },
)

await server.connect(new StdioServerTransport())
