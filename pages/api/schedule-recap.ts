import type { NextApiRequest, NextApiResponse } from 'next';

interface ScheduleResponse {
  success: boolean;
  message: string;
  session?: 'asia' | 'london' | 'us';
  timestamp?: string;
}

function getCurrentSession(): 'asia' | 'london' | 'us' | null {
  const now = new Date();
  const utcHour = now.getUTCHours();

  // Asia session: 00:00-08:00 UTC (approximate)
  if (utcHour >= 0 && utcHour < 8) {
    return 'asia';
  }
  // London session: 08:00-16:00 UTC (approximate)
  else if (utcHour >= 8 && utcHour < 16) {
    return 'london';
  }
  // US session: 16:00-24:00 UTC (approximate)
  else if (utcHour >= 16) {
    return 'us';
  }

  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScheduleResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Determine current trading session based on UTC time
    const currentSession = getCurrentSession();
    
    if (!currentSession) {
      return res.status(400).json({
        success: false,
        message: 'No active trading session at current time'
      });
    }

    // Call generate-session-recap endpoint
    const timestamp = new Date().toISOString();
    const recapUrl = new URL('/api/generate-session-recap', 'http://localhost:3000');
    recapUrl.searchParams.set('session', currentSession);

    const response = await fetch(recapUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to generate recap: ${response.statusText}`);
    }

    return res.status(200).json({
      success: true,
      message: `${currentSession.charAt(0).toUpperCase() + currentSession.slice(1)} session recap generated at ${new Date().toUTCString()}`,
      session: currentSession,
      timestamp
    });
  } catch (error) {
    console.error('Schedule Recap Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to schedule recap generation'
    });
  }
}