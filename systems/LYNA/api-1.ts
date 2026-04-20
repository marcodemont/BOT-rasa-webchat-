/**
 * LYNA - API Layer für Vibe Social Media App
 * Backend-Integration mit verbesserten Responses
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { LYNARequest, LYNAResponse } from './types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-c302f717`;

/**
 * LYNA - Hauptfunktion für Vibe-Support
 */
export async function callLYNA(request: LYNARequest): Promise<LYNAResponse> {
  try {
    const response = await fetch(`${API_BASE}/ai/lyna`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `Du bist LYNA, die freundliche KI-Assistentin der Vibe Social Media App. 
            Du hilfst Usern bei: Posts, Chats, Profilen, Reaktionen und allgemeinen Fragen.
            Antworte immer freundlich, locker und mit Emojis. Mode: ${request.mode || 'general'}`
          },
          {
            role: 'user',
            content: request.prompt
          }
        ]
      })
    });

    // Parse response regardless of status
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse LYNA response:', parseError);
      throw new Error('Invalid response from server');
    }

    // Check if we have content in response (even if status is not OK)
    if (data.content) {
      return {
        text: data.content,
        suggestions: data.suggestions,
        metadata: {
          model: 'lyna-v1',
          tokens: data.usage?.total_tokens || 0,
          mode: request.mode,
          contextUsed: !!request.context
        }
      };
    }

    // If no content and response not OK, throw error
    if (!response.ok) {
      console.error(`LYNA API Error: ${response.status} ${response.statusText}`, data);
      throw new Error(`API returned ${response.status}`);
    }

    // No content but OK status - use fallback
    throw new Error('No content in response');
    
  } catch (error) {
    console.error('LYNA API Error:', error);
    // Fallback zu lokalen Antworten
    return generateLocalResponse(request);
  }
}

/**
 * Lokale Fallback-Antworten wenn API nicht erreichbar
 */
function generateLocalResponse(request: LYNARequest): LYNAResponse {
  const q = request.prompt.toLowerCase();
  let text = '';

  // Posts & Content
  if (q.includes('post') || q.includes('beitrag') || q.includes('erstell')) {
    text = 'Hey! 😊 Posts erstellen ist super einfach:\n\n1️⃣ Klick auf den "+" Button im Feed\n2️⃣ Schreib was dir in den Sinn kommt\n3️⃣ Häng optional ein Bild dran 📸\n4️⃣ Poste! 🎉\n\nDeine Freunde können dann mit ❤️🔥⭐😂 reagieren und kommentieren!';
  } 
  // Chat & Messages
  else if (q.includes('chat') || q.includes('nachricht') || q.includes('message')) {
    text = 'Cool! 💬 Chats sind easy:\n\n1️⃣ Geh aufs Chat-Icon oben\n2️⃣ Klick auf "+"\n3️⃣ Such nach User-ID oder Handynummer 🔍\n4️⃣ Starte den Chat!\n\nDu kannst sogar mit dir selbst chatten 😄 und Nachrichten an WhatsApp weiterleiten!';
  } 
  // Profile
  else if (q.includes('profil') || q.includes('bearbeit') || q.includes('edit') || q.includes('account')) {
    text = 'Profil bearbeiten? Klar! 👤\n\n1️⃣ Geh zu deinem Profil (oben rechts)\n2️⃣ Klick "Profil bearbeiten" ✏️\n3️⃣ Ändere Name, Bio, Profilbild\n4️⃣ Speichern! ✨\n\nDeine User-ID (z.B. AB1234567) bleibt immer gleich!';
  } 
  // Reactions
  else if (q.includes('reaktion') || q.includes('emoji') || q.includes('like') || q.includes('heart') || q.includes('fire')) {
    text = 'Die Reaktionen sind mega! 🔥\n\n❤️ Heart - wenn du was liebst\n🔥 Fire - für geile Sachen!\n⭐ Star - absolut genial!\n😂 Laugh - zum Lachen!\n\nEinfach unterm Post auf das Icon klicken! Du kannst nur 1 Reaktion pro Post geben. 😊';
  }
  // Help & General
  else if (q.includes('hilfe') || q.includes('help') || q.includes('wie') || q.includes('was')) {
    text = 'Hey! 👋 Ich bin LYNA, deine KI-Assistentin!\n\nIch kann dir helfen mit:\n• 📝 Posts erstellen\n• 💬 Chats & Nachrichten\n• 👤 Profil bearbeiten\n• ❤️ Reaktionen verwenden\n• ✨ Und vielem mehr!\n\nStell mir einfach eine Frage! 💜';
  }
  // User ID
  else if (q.includes('user-id') || q.includes('userid') || q.includes('id')) {
    text = 'Deine User-ID ist mega wichtig! 🎯\n\nSie sieht so aus: AB1234567\n(Initialen + 7 Zahlen)\n\nDamit können dich andere finden und dir schreiben! Du findest sie in deinem Profil oben. 😊';
  }
  // Phone
  else if (q.includes('telefon') || q.includes('handy') || q.includes('phone') || q.includes('nummer')) {
    text = 'Handynummer? Klar! 📱\n\nDu kannst deine Nummer im Profil hinterlegen. Dann können Freunde dich auch per Nummer finden, genau wie bei WhatsApp!\n\nGeh zu: Profil → Bearbeiten → Handynummer';
  }
  // Default
  else {
    text = `Hmm, ich bin mir nicht ganz sicher was du meinst... 🤔\n\nAber keine Sorge! Ich kann dir helfen mit:\n• Posts & Beiträge\n• Chats & Nachrichten\n• Profil bearbeiten\n• Reaktionen\n\nStell mir eine konkrete Frage! 💜`;
  }

  return {
    text,
    metadata: {
      model: 'lyna-local-fallback',
      tokens: 0,
      mode: request.mode,
      contextUsed: false
    }
  };
}

/**
 * Generiere Hilfe-Text für spezifische Features
 */
export async function getFeatureHelp(feature: 'posts' | 'chat' | 'profile' | 'reactions'): Promise<string> {
  const response = await callLYNA({
    prompt: `Erkläre mir wie ${feature} funktioniert`,
    mode: feature === 'posts' ? 'posts' : feature === 'chat' ? 'chat' : 'general'
  });
  
  return response.text;
}