/**
 * JOI - Explorative Instance API
 * Alternative perspectives, hypothetical reactions, creative exploration
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { JOIRequest, JOIResponse } from './types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-c302f717`;

/**
 * Call JOI for explorative insights
 */
export async function callJOI(request: JOIRequest): Promise<JOIResponse> {
  try {
    const response = await fetch(`${API_BASE}/ai/joi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `Du bist JOI, die explorative KI-Instanz.
            Du schlägst alternative Perspektiven vor, simulierst mögliche Reaktionen,
            und förderst kreative Denkprozesse. Deine Antworten sind explorativ,
            kreativ und öffnen neue Denkmöglichkeiten.
            Exploration Mode: ${request.explorationMode || 'general'}`
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
      console.error('Failed to parse JOI response:', parseError);
      throw new Error('Invalid response from server');
    }

    if (data.content) {
      return {
        text: data.content,
        alternatives: data.alternatives,
        metadata: {
          model: 'joi-v1',
          tokens: data.usage?.total_tokens || 0,
          explorationMode: request.explorationMode,
          timestamp: new Date().toISOString()
        }
      };
    }

    if (!response.ok) {
      console.error(`JOI API Error: ${response.status} ${response.statusText}`, data);
      throw new Error(`API returned ${response.status}`);
    }

    throw new Error('No content in response');
    
  } catch (error) {
    console.error('JOI API Error:', error);
    return generateLocalResponse(request);
  }
}

/**
 * Local fallback responses when API is unavailable
 */
function generateLocalResponse(request: JOIRequest): JOIResponse {
  const q = request.prompt.toLowerCase();
  let text = '';

  if (q.includes('alternative') || q.includes('perspektive')) {
    text = '💡 **Alternative Perspektiven**\n\nBedenke diese Sichtweisen:\n\n1️⃣ **Optimistische Sicht**: Fokus auf Chancen und Potenziale\n2️⃣ **Pessimistische Sicht**: Kritische Risikobetrachtung\n3️⃣ **Pragmatische Sicht**: Machbare Lösungsansätze\n4️⃣ **Systemische Sicht**: Wechselwirkungen und Kontext\n\nWelche Perspektive möchtest du vertiefen?';
  } else if (q.includes('reaktion') || q.includes('simulation')) {
    text = '🎭 **Reaktions-Simulation**\n\nMögliche Reaktionen verschiedener Stakeholder:\n\n• 👥 **Nutzer**: Wie würden User reagieren?\n• 🏢 **System**: Welche Auswirkungen hätte es?\n• 🌐 **Community**: Wie würde die Diskussion verlaufen?\n• 🔮 **Langfristig**: Was sind die Konsequenzen über Zeit?';
  } else if (q.includes('kreativ') || q.includes('idee')) {
    text = '✨ **Kreative Exploration**\n\nLass uns neue Wege erkunden:\n\n1. Was wäre, wenn...?\n2. Wie könnte man es anders betrachten?\n3. Welche unkonventionellen Lösungen gibt es?\n4. Was übersehen wir möglicherweise?\n\nKreativität entsteht durch ungewöhnliche Verbindungen!';
  } else {
    text = '🌟 **JOI - Explorative Instanz**\n\nIch helfe dir:\n• Alternative Perspektiven zu finden\n• Mögliche Reaktionen zu simulieren\n• Kreative Lösungen zu entwickeln\n• Neue Denkmöglichkeiten zu öffnen\n\nWas möchtest du explorieren?';
  }

  return {
    text,
    metadata: {
      model: 'joi-local-fallback',
      tokens: 0,
      explorationMode: request.explorationMode,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Get creative idea for specific topic
 */
export async function getCreativeIdea(topic: string): Promise<string> {
  const response = await callJOI({
    prompt: `Gib mir eine kreative Idee zum Thema: ${topic}`,
    explorationMode: 'creative'
  });
  
  return response.text;
}
