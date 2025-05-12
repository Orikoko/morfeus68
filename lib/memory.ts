export interface MemoryEntry {
  pair: string;
  agentVotes: {
    macro: string;
    technical: string;
    sentiment: string;
    intermarket: string;
  };
  finalLabel: string;
  edge_score: number;
  timestamp: string;
  outcome?: 'correct' | 'incorrect';
}

// In-memory storage for session data
const memory: MemoryEntry[] = [];

/**
 * Stores a new session entry in memory
 */
export function storeSession(entry: MemoryEntry): void {
  memory.unshift(entry); // Add to start of array for chronological order
  
  // Keep only last 100 entries to prevent unbounded growth
  if (memory.length > 100) {
    memory.length = 100;
  }
}

/**
 * Retrieves all stored session history
 */
export function getMemory(): MemoryEntry[] {
  return memory;
}

/**
 * Updates a session's outcome
 */
export function updateOutcome(timestamp: string, outcome: 'correct' | 'incorrect'): void {
  const entry = memory.find(e => e.timestamp === timestamp);
  if (entry) {
    entry.outcome = outcome;
  }
}