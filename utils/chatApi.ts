/**
 * Chat API - Frontend Client for LYNA, JOI, AURA
 * Connects to backend chat endpoints
 */

import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e27c6bd5`;

interface ChatResponse {
  response: string;
  conversationId: string;
}

/**
 * Send message to LYNA
 */
export async function sendToLYNA(
  message: string,
  userId?: string,
  userType?: 'patient' | 'doctor' | 'public',
  patientId?: string,
  conversationId?: string,
  context?: string
): Promise<ChatResponse> {
  const response = await fetch(`${BASE_URL}/chat/lyna`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({
      message,
      userId,
      userType,
      patientId,
      conversationId,
      context
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LYNA API error: ${error}`);
  }

  return response.json();
}

/**
 * Send message to JOI
 */
export async function sendToJOI(
  message: string,
  userId?: string,
  conversationId?: string,
  context?: string
): Promise<ChatResponse> {
  const response = await fetch(`${BASE_URL}/chat/joi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({
      message,
      userId,
      conversationId,
      context
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`JOI API error: ${error}`);
  }

  return response.json();
}

/**
 * Send message to AURA
 */
export async function sendToAURA(
  message: string,
  userId?: string,
  conversationId?: string,
  context?: string
): Promise<ChatResponse> {
  const response = await fetch(`${BASE_URL}/chat/aura`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({
      message,
      userId,
      conversationId,
      context
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AURA API error: ${error}`);
  }

  return response.json();
}
