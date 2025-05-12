import { Matrix } from 'ml-matrix';
import { marketAnalyzer } from './market-analysis';

interface Pattern {
  name: string;
  confidence: number;
  timeframe: string;
  supporting_evidence: string[];
}

interface MarketCondition {
  volatility: number;
  trend_strength: number;
  momentum: number;
  volume_profile: 'increasing' | 'decreasing' | 'stable';
}

export class PatternRecognizer {
  private patterns: Pattern[] = [];
  private recentConditions: MarketCondition[] = [];

  addMarketCondition(condition: MarketCondition) {
    this.recentConditions.push(condition);
    if (this.recentConditions.length > 100) {
      this.recentConditions.shift();
    }
  }

  async analyzePatterns(prices: number[], volumes: number[]): Promise<Pattern[]> {
    this.patterns = [];
    
    // Technical pattern recognition
    await this.detectTechnicalPatterns(prices);
    
    // Volume pattern analysis
    this.analyzeVolumePatterns(volumes);
    
    // Correlation analysis
    await this.analyzeCorrelations();
    
    // Filter and sort patterns by confidence
    return this.patterns
      .filter(p => p.confidence > 65)
      .sort((a, b) => b.confidence - a.confidence);
  }

  private async detectTechnicalPatterns(prices: number[]) {
    // Head and Shoulders
    if (this.isHeadAndShoulders(prices)) {
      this.patterns.push({
        name: 'Head and Shoulders',
        confidence: this.calculatePatternConfidence('head_shoulders'),
        timeframe: 'medium',
        supporting_evidence: ['Price action', 'Volume confirmation']
      });
    }

    // Double Top/Bottom
    if (this.isDoublePattern(prices)) {
      this.patterns.push({
        name: 'Double Formation',
        confidence: this.calculatePatternConfidence('double'),
        timeframe: 'short',
        supporting_evidence: ['Price levels', 'Momentum']
      });
    }

    // Triangle Patterns
    const triangleType = this.detectTrianglePattern(prices);
    if (triangleType) {
      this.patterns.push({
        name: `${triangleType} Triangle`,
        confidence: this.calculatePatternConfidence('triangle'),
        timeframe: 'medium',
        supporting_evidence: ['Trend lines', 'Volume analysis']
      });
    }
  }

  private analyzeVolumePatterns(volumes: number[]) {
    const volumeProfile = this.calculateVolumeProfile(volumes);
    const priceVolCorrelation = this.calculatePriceVolumeCorrelation();

    if (volumeProfile === 'increasing' && priceVolCorrelation > 0.7) {
      this.patterns.push({
        name: 'Volume Breakout',
        confidence: 85,
        timeframe: 'short',
        supporting_evidence: ['Rising volume', 'Price correlation']
      });
    }
  }

  private async analyzeCorrelations() {
    try {
      const correlationMatrix = await this.getCorrelationMatrix();
      const significantCorrelations = this.findSignificantCorrelations(correlationMatrix);

      for (const correlation of significantCorrelations) {
        this.patterns.push({
          name: `Correlation Pattern: ${correlation.pairs.join(' vs ')}`,
          confidence: correlation.strength * 100,
          timeframe: 'medium',
          supporting_evidence: ['Inter-market analysis', 'Statistical correlation']
        });
      }
    } catch (error) {
      console.error('Correlation analysis failed:', error);
    }
  }

  private isHeadAndShoulders(prices: number[]): boolean {
    if (prices.length < 20) return false;
    
    // Simplified H&S detection logic
    const peaks = this.findPeaks(prices);
    if (peaks.length < 3) return false;

    const peakValues = peaks.map(i => prices[i]);
    const middle = Math.floor(peaks.length / 2);
    
    return (
      peakValues[middle] > peakValues[middle - 1] &&
      peakValues[middle] > peakValues[middle + 1] &&
      Math.abs(peakValues[middle - 1] - peakValues[middle + 1]) / peakValues[middle - 1] < 0.02
    );
  }

  private isDoublePattern(prices: number[]): boolean {
    if (prices.length < 15) return false;
    
    const extremes = this.findExtremes(prices);
    if (extremes.length < 2) return false;

    const diff = Math.abs(prices[extremes[0]] - prices[extremes[1]]);
    return diff / prices[extremes[0]] < 0.01;
  }

  private detectTrianglePattern(prices: number[]): 'Ascending' | 'Descending' | 'Symmetric' | null {
    if (prices.length < 20) return null;

    const highs = this.calculateTrendline(this.findPeaks(prices));
    const lows = this.calculateTrendline(this.findTroughs(prices));

    if (Math.abs(highs.slope) < 0.001 && lows.slope > 0.001) {
      return 'Ascending';
    } else if (highs.slope < -0.001 && Math.abs(lows.slope) < 0.001) {
      return 'Descending';
    } else if (highs.slope < -0.001 && lows.slope > 0.001) {
      return 'Symmetric';
    }

    return null;
  }

  private findPeaks(data: number[]): number[] {
    const peaks: number[] = [];
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
        peaks.push(i);
      }
    }
    return peaks;
  }

  private findTroughs(data: number[]): number[] {
    const troughs: number[] = [];
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] < data[i - 1] && data[i] < data[i + 1]) {
        troughs.push(i);
      }
    }
    return troughs;
  }

  private findExtremes(data: number[]): number[] {
    return [...this.findPeaks(data), ...this.findTroughs(data)]
      .sort((a, b) => a - b);
  }

  private calculateTrendline(points: number[]): { slope: number; intercept: number } {
    if (points.length < 2) {
      return { slope: 0, intercept: 0 };
    }

    const n = points.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += points[i];
      sumY += i;
      sumXY += points[i] * i;
      sumX2 += points[i] * points[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private calculatePatternConfidence(patternType: string): number {
    // Mock implementation - replace with actual confidence calculation
    const baseConfidence = 75;
    const volatilityAdjustment = this.recentConditions.length > 0
      ? this.recentConditions[this.recentConditions.length - 1].volatility * 0.2
      : 0;
    
    return Math.min(95, Math.max(60, baseConfidence + volatilityAdjustment));
  }

  private calculateVolumeProfile(volumes: number[]): 'increasing' | 'decreasing' | 'stable' {
    const recentVolumes = volumes.slice(-5);
    const avgChange = recentVolumes.reduce((acc, vol, i) => {
      if (i === 0) return acc;
      return acc + ((vol - recentVolumes[i - 1]) / recentVolumes[i - 1]);
    }, 0) / (recentVolumes.length - 1);

    if (avgChange > 0.05) return 'increasing';
    if (avgChange < -0.05) return 'decreasing';
    return 'stable';
  }

  private calculatePriceVolumeCorrelation(): number {
    // Mock implementation - replace with actual correlation calculation
    return 0.85;
  }

  private async getCorrelationMatrix(): Promise<Matrix> {
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
    return marketAnalyzer.calculateCorrelationMatrix(pairs);
  }

  private findSignificantCorrelations(matrix: Matrix): Array<{
    pairs: string[];
    strength: number;
  }> {
    // Mock implementation - replace with actual correlation analysis
    return [{
      pairs: ['EURUSD', 'GBPUSD'],
      strength: 0.85
    }];
  }
}

export const patternRecognizer = new Pattern