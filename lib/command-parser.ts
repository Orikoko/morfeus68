interface CommandPattern {
  pattern: RegExp;
  handler: (matches: RegExpMatchArray) => Promise<CommandResponse>;
}

export async function parseCommand(message: string): Promise<CommandResponse> {
  const patterns: CommandPattern[] = [
    {
      pattern: /(?:show|get|what is|what's)(?: the)? bias for ([A-Z]{3}\/[A-Z]{3})/i,
      handler: async (matches) => {
        const pair = matches[1].toUpperCase();
        const response = await fetch('/api/morfeus-meta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pair })
        });
        const data = await response.json();
        return {
          response: `Analysis for ${pair}: ${data.summary}`,
          action: { type: 'getBias', data }
        };
      }
    },
    {
      pattern: /export(?:ing)?(?: my)? session/i,
      handler: async () => {
        const response = await fetch('/api/export-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ format: 'pdf' })
        });
        const data = await response.json();
        return {
          response: 'Generating session export as PDF...',
          action: { type: 'exportSession', data }
        };
      }
    },
    {
      pattern: /(?:show|get|what are)(?: the)? top(?:performing)? pairs/i,
      handler: async () => {
        const memory = await fetch('/api/agent-conflict').then(r => r.json());
        const topPairs = memory.conflict_entries
          .filter(e => e.edge_score > 75)
          .slice(0, 3)
          .map(e => `${e.pair} (${e.edge_score}% edge)`);
        
        return {
          response: `Top performing pairs: ${topPairs.join(', ')}`,
          action: { type: 'getTopPairs', data: topPairs }
        };
      }
    },
    {
      pattern: /(?:show|get|any|what)(?:are the)? conflicts/i,
      handler: async () => {
        const response = await fetch('/api/agent-conflict').then(r => r.json());
        return {
          response: response.analysis_summary,
          action: { type: 'showConflicts', data: response }
        };
      }
    }
  ];

  // Try to match command patterns
  for (const { pattern, handler } of patterns) {
    const matches = message.match(pattern);
    if (matches) {
      return handler(matches);
    }
  }

  // Default response for unrecognized commands
  return {
    response: "I'm not sure what you're asking. Try asking about pair bias, exporting your session, or checking top pairs."
  };
}