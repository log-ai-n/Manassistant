import { McpServer } from '@modelcontextprotocol/sdk';
import { z } from 'zod';

const server = new McpServer({
  name: 'weather',
  version: '1.0.0',
});

server.tool(
  'getWeather',
  {
    location: z.string().describe('The location to get weather for'),
  },
  async ({ location }) => {
    // This is a mock implementation
    return `Weather forecast for ${location}: Sunny with a high of 75°F`;
  }
);

server.start(); 