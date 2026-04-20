/**
 * LYNA Core - Type Definitions and Dummy Implementation
 * 
 * This file provides type definitions for LYNA medical analysis.
 * The actual medical analysis is handled by the backend FNN engine.
 */

export interface AnalysisFlag {
  flagType: string;
  severity: number;
  triggeredBy: {
    rule: string;
    ruleVersion: string;
    threshold: number;
    actualValue: number;
  };
}

export interface AnalysisState {
  stateId: string;
  analysisVersion: string;
  overallSeverity: number;
  overallConfidence: number;
  flags: AnalysisFlag[];
}

export interface AIExplanation {
  summary: string;
  findings?: string[];
  recommendations?: string[];
}

export interface AnalysisResult {
  analysisState: AnalysisState;
  explanation?: AIExplanation;
}

export interface AnalysisOptions {
  baseline?: {
    mean: number;
    std: number;
    established: string;
    sampleSize: number;
  };
  userLevel?: string;
  includeExplanation?: boolean;
}

/**
 * LYNA System - Dummy Implementation
 * 
 * This is a simplified implementation for demo purposes.
 * In production, this would call the backend FNN engine.
 */
export class LYNASystem {
  async analyze(
    signal: number[],
    timestamps: string[],
    signalType: string,
    options?: AnalysisOptions
  ): Promise<AnalysisResult> {
    // Generate a simple demo analysis
    const stateId = this.generateId();
    const mean = this.calculateMean(signal);
    const std = this.calculateStd(signal, mean);
    
    // Simple rule-based check
    const flags: AnalysisFlag[] = [];
    
    if (options?.baseline) {
      const deviation = Math.abs(mean - options.baseline.mean);
      const threshold = options.baseline.std * 2;
      
      if (deviation > threshold) {
        flags.push({
          flagType: "SIGNIFICANT_DEVIATION",
          severity: 2,
          triggeredBy: {
            rule: "BASELINE_DEVIATION_RULE",
            ruleVersion: "1.0.0",
            threshold: threshold,
            actualValue: deviation,
          },
        });
      }
    }
    
    const analysisState: AnalysisState = {
      stateId,
      analysisVersion: "DEMO_1.0.0",
      overallSeverity: flags.length > 0 ? 2 : 0,
      overallConfidence: 0.85,
      flags,
    };
    
    let explanation: AIExplanation | undefined;
    
    if (options?.includeExplanation) {
      explanation = {
        summary: "Demo-Analyse: Die Werte zeigen normale Variabilität. In einer Produktionsumgebung würde hier die vollständige FNN-Analyse erfolgen.",
        findings: [
          "Mittlerer Wert: " + mean.toFixed(2),
          "Standardabweichung: " + std.toFixed(2),
          "Anzahl Samples: " + signal.length,
        ],
        recommendations: [
          "Dies ist eine Demo-Implementierung",
          "Für echte medizinische Analysen Backend verwenden",
        ],
      };
    }
    
    return {
      analysisState,
      explanation,
    };
  }
  
  private generateId(): string {
    return "demo_" + Math.random().toString(36).substring(2, 15);
  }
  
  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  private calculateStd(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}
