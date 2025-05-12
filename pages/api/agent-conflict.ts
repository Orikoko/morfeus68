import type { NextApiRequest, NextApiResponse } from 'next';
import { getMemory } from '../../lib/memory';
import type { ConflictAnalysisResponse, ConflictEntry } from '../../types/conflict';

function findConflictingAgents(votes: Record<string, string>): string[] {
  const uniqueVotes = new Set(Object.values(votes));
  if (uniqueVotes.size === 1) return []; // No conflicts

  const conflicts: string[] = [];
  const majorityVote = Object.entries(votes)
    .reduce((acc, [agent, vote]) => {
      acc[vote] = (acc[vote] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const majority = Object.entries(majorityVote)
    .sort((a, b) => b[1] - a[1])[0][0];

  Object.entries(votes).forEach(([agent, vote]) => {
    if (vote !== majority) {
      conflicts.push(agent);
    }
  });

  return conflicts;
}

function determineConflictLevel(conflictingAgents: string[]): 'low' | 'medium' | 'high' {
  switch (conflictingAgents.length) {
    case 0:
    case 1:
      return 'low';
    case 2:
      return 'medium';
    default:
      return 'high';
  }
}

function generateAnalysisSummary(conflicts: ConflictEntry[]): string {
  if (conflicts.length === 0) {
    return 'No significant agent conflicts detected in recent trading sessions.';
  }

  const highConflicts = conflicts.filter(c => c.conflict_level === 'high');
  const mediumConflicts = conflicts.filter(c => c.conflict_level === 'medium');
  const lowConflicts = conflicts.filter(c => c.conflict_level === 'low');

  const summaryParts = [];

  if (highConflicts.length > 0) {
    const recentHigh = highConflicts[0];
    summaryParts.push(
      `Found ${highConflicts.length} high-level conflicts, most recent in ${recentHigh.pair} ` +
      `where ${recentHigh.conflicting_agents.join(', ')} disagreed with majority view.`
    );
  }

  if (mediumConflicts.length > 0) {
    summaryParts.push(
      `Detected ${mediumConflicts.length} medium-level conflicts showing partial agent disagreement.`
    );
  }

  if (lowConflicts.length > 0) {
    summaryParts.push(
      `Observed ${lowConflicts.length} low-level conflicts with minimal agent divergence.`
    );
  }

  const commonPairs = conflicts
    .map(c => c.pair)
    .reduce((acc, pair) => {
      acc[pair] = (acc[pair] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const mostConflicted = Object.entries(commonPairs)
    .sort((a, b) => b[1] - a[1])[0];

  if (mostConflicted) {
    summaryParts.push(
      `${mostConflicted[0]} shows the highest conflict frequency with ${mostConflicted[1]} instances.`
    );
  }

  return summaryParts.join(' ');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConflictAnalysisResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      timestamp: new Date().toISOString(),
      total_entries_analyzed: 0,
      conflict_entries: [],
      analysis_summary: 'Method not allowed'
    });
  }

  try {
    const memory = getMemory();
    const conflictEntries: ConflictEntry[] = [];

    memory.forEach(entry => {
      const conflictingAgents = findConflictingAgents(entry.agentVotes);
      
      if (conflictingAgents.length > 0) {
        const conflict_level = determineConflictLevel(conflictingAgents);
        
        conflictEntries.push({
          pair: entry.pair,
          timestamp: entry.timestamp,
          conflict_level,
          conflicting_agents,
          agent_votes: entry.agentVotes,
          final_label: entry.finalLabel,
          edge_score: entry.edge_score
        });
      }
    });

    const response: ConflictAnalysisResponse = {
      timestamp: new Date().toISOString(),
      total_entries_analyzed: memory.length,
      conflict_entries: conflictEntries,
      analysis_summary: generateAnalysisSummary(conflictEntries)
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Agent Conflict Analysis Error:', error);
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      total_entries_analyzed: 0,
      conflict_entries: [],
      analysis_summary: 'Analysis failed due to internal error'
    });
  }
}