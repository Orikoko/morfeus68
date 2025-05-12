interface JournalEntry {
  timestamp: string;
  daily_stats: {
    win_rate: number;
    top_agent: string;
    bottom_agent: string;
    notable_pairs: string[];
  };
  reflection: string;
}

const journal: JournalEntry[] = [];

export function addJournalEntry(entry: JournalEntry): void {
  journal.unshift(entry);
  
  // Keep last 30 days of entries
  if (journal.length > 30) {
    journal.length = 30;
  }
}

export function getJournal(): JournalEntry[] {
  return journal;
}