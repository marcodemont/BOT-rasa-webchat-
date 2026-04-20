/**
 * LYNA System - Cognitive AI Assistants for AURIX.design
 * 
 * Das LYNA-System besteht aus verschiedenen KI-Assistenten:
 * - LYNA: Hauptassistentin für kognitive Unterstützung
 * - AURA: READ-ONLY analytische Assistentin
 * - JOI: Explorative Assistentin
 */

export { LYNA_Unified } from './LYNA_Unified';
export { AuraChatBot } from './AURA_Chat';
export { JOIChatBot } from './JOI_Chat';

// Re-export for backwards compatibility
export { LYNA_Unified as LYNA } from './LYNA_Unified';
