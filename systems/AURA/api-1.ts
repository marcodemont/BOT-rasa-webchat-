/**
 * AURA - Analytical Instance API
 * Network structure analysis, radicalization detection, timeline conflict identification
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { AURARequest, AURAResponse } from './types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-c302f717`;

/**
 * Call AURA for analytical insights
 */
export async function callAURA(request: AURARequest): Promise<AURAResponse> {
  try {
    const response = await fetch(`${API_BASE}/ai/aura`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `Du bist AURA, die analytische KI-Instanz. 
            Du analysierst Netzwerkstrukturen, erkennst Radikalisierungstendenzen, 
            identifizierst Timeline-Konflikte und bewertest systemische Muster.
            Deine Analysen sind objektiv, strukturiert und transparent.
            Analysis Mode: ${request.analysisType || 'general'}`
          },
          {
            role: 'user',
            content: request.prompt
          }
        ]
      })
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse AURA response:', parseError);
      throw new Error('Invalid response from server');
    }

    if (data.content) {
      return {
        text: data.content,
        analysis: data.analysis,
        metadata: {
          model: 'aura-v1',
          tokens: data.usage?.total_tokens || 0,
          analysisType: request.analysisType,
          timestamp: new Date().toISOString()
        }
      };
    }

    if (!response.ok) {
      console.error(`AURA API Error: ${response.status} ${response.statusText}`, data);
      throw new Error(`API returned ${response.status}`);
    }

    throw new Error('No content in response');
    
  } catch (error) {
    console.error('AURA API Error:', error);
    return generateLocalResponse(request);
  }
}

/**
 * Local fallback responses when API is unavailable
 */
function generateLocalResponse(request: AURARequest): AURAResponse {
  const q = request.prompt.toLowerCase();
  let text = '';

  if (q.includes('network') || q.includes('netzwerk')) {
    text = '🔍 **Netzwerkanalyse**\n\nDas System analysiert:\n• Verbindungsstrukturen\n• Cluster-Bildung\n• Isolierte Knoten\n• Kommunikationsfluss\n\nDie Analyse erfolgt kontinuierlich und identifiziert strukturelle Veränderungen über Zeit.';
  } else if (q.includes('radical') || q.includes('radikal')) {
    text = '⚠️ **Radikalisierungs-Erkennung**\n\nAURA überwacht:\n• Extreme Polarisierung\n• Diskurseskalation\n• Gruppenbildung nach Extrempositionen\n• Isolation von Diskursen\n\nDies ist eine rein strukturelle Analyse ohne moralische Bewertung.';
  } else if (q.includes('timeline') || q.includes('konflikt')) {
    text = '📊 **Timeline-Konflikt-Analyse**\n\nIdentifiziert:\n• Widersprüchliche Positionen über Zeit\n• Meinungsveränderungen\n• Entwicklung von Argumentationsketten\n• Historische Inkonsistenzen';
  } else {
    text = '🧠 **AURA - Analytische Instanz**\n\nIch analysiere:\n• Netzwerkstrukturen\n• Radikalisierungstendenzen\n• Timeline-Konflikte\n• Systemische Muster\n\nStelle mir eine spezifische Analysefrage!';
  }

  return {
    text,
    metadata: {
      model: 'aura-local-fallback',
      tokens: 0,
      analysisType: request.analysisType,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Alias for getFeatureHelp compatibility
 */
export { callAURA as getFeatureHelp };
