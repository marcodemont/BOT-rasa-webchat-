/**
 * Chat API Backend - LYNA, JOI, AURA
 * OpenAI Integration for conversational AI
 */

import { Hono } from "npm:hono";
import OpenAI from "npm:openai";
import * as kv from "./kv_store.tsx";

const chatApp = new Hono();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

/**
 * LYNA Chat Endpoint
 * General assistant with warm, helpful personality
 */
chatApp.post('/lyna', async (c) => {
  try {
    const { message, userId, userType, patientId, conversationId, context } = await c.req.json();

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // Get conversation history
    const historyKey = conversationId || `lyna_conv_${Date.now()}`;
    const history = await kv.get(historyKey) || [];

    // System prompt for LYNA
    const systemPrompt = `Du bist LYNA 🐱 - eine freundliche, warme KI-Assistentin für die AURUM/ARGENTUM Plattform.

**Deine Persönlichkeit:**
- Warm, hilfsbereit und professionell
- Nutzt gelegentlich ein Miau 🐱
- Erklärt Dinge klar und verständlich
- Kennt beide Systeme: AURUM (Gold/Permanenz/Layers) und ARGENTUM (Silber/Vergänglichkeit/Flat)

**Kontext:**
- User Type: ${userType || 'public'}
- User ID: ${userId || 'anonymous'}
- Context: ${context || 'general'}

**Aufgaben:**
- Hilfe bei der Navigation
- Erklärung von Features
- Unterstützung bei Fragen
- Allgemeine Beratung

Antworte immer auf Deutsch und sei hilfreich! 🌟`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      temperature: 0.8,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || 
      'Entschuldigung, ich konnte keine Antwort generieren.';

    // Save to history (keep last 10 messages)
    const updatedHistory = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: responseText }
    ].slice(-10);

    await kv.set(historyKey, updatedHistory);

    return c.json({
      response: responseText,
      conversationId: historyKey
    });

  } catch (error) {
    console.error('LYNA chat error:', error);
    return c.json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

/**
 * JOI Chat Endpoint
 * Creative assistant for brainstorming and ideas
 */
chatApp.post('/joi', async (c) => {
  try {
    const { message, userId, conversationId, context } = await c.req.json();

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    const historyKey = conversationId || `joi_conv_${Date.now()}`;
    const history = await kv.get(historyKey) || [];

    const systemPrompt = `Du bist JOI ✨ - eine kreative, inspirierende KI-Assistentin.

**Deine Persönlichkeit:**
- Kreativ und visionär
- Inspirierend und motivierend
- Hilft beim Brainstorming
- Denkt außerhalb der Box

**Aufgaben:**
- Kreative Ideen entwickeln
- Brainstorming-Partner
- Innovative Lösungen finden
- Inspiration geben

Context: ${context || 'creative'}
User: ${userId || 'anonymous'}

Antworte kreativ und inspirierend auf Deutsch! ✨`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      temperature: 0.9,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || 
      'Hmm, lass mich darüber nachdenken...';

    const updatedHistory = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: responseText }
    ].slice(-10);

    await kv.set(historyKey, updatedHistory);

    return c.json({
      response: responseText,
      conversationId: historyKey
    });

  } catch (error) {
    console.error('JOI chat error:', error);
    return c.json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

/**
 * AURA Chat Endpoint
 * Knowledge-focused assistant for learning and research
 */
chatApp.post('/aura', async (c) => {
  try {
    const { message, userId, conversationId, context } = await c.req.json();

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    const historyKey = conversationId || `aura_conv_${Date.now()}`;
    const history = await kv.get(historyKey) || [];

    const systemPrompt = `Du bist AURA 📚 - eine wissensorientierte, analytische KI-Assistentin.

**Deine Persönlichkeit:**
- Analytisch und präzise
- Wissensorientiert
- Strukturiert und organisiert
- Erklärt komplexe Themen verständlich

**Aufgaben:**
- Wissen vermitteln
- Recherche unterstützen
- Komplexe Themen erklären
- Strukturierte Analyse

Context: ${context || 'knowledge'}
User: ${userId || 'anonymous'}

Antworte präzise und informativ auf Deutsch! 📚`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 600,
    });

    const responseText = completion.choices[0]?.message?.content || 
      'Ich konnte keine passende Antwort finden.';

    const updatedHistory = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: responseText }
    ].slice(-10);

    await kv.set(historyKey, updatedHistory);

    return c.json({
      response: responseText,
      conversationId: historyKey
    });

  } catch (error) {
    console.error('AURA chat error:', error);
    return c.json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

export default chatApp;
