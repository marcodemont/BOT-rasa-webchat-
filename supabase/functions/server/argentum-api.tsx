/**
 * ARGENTUM API
 * Minimal persistence, flat structure, immediate operations
 */

import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

// Supabase client for auth verification (use ANON_KEY for user tokens)
const getSupabaseAuthClient = () => createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

// Helper: Verify user authentication and return user ID
async function getUserId(c: any): Promise<string> {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("ARGENTUM Auth failed: No authorization header or invalid format");
    throw new Error("Not authenticated");
  }
  
  const token = authHeader.split(" ")[1];
  if (!token) {
    console.error("ARGENTUM Auth failed: No token in authorization header");
    throw new Error("No token provided");
  }
  
  console.log('🔑 ARGENTUM: Token extracted, length:', token.length);
  console.log('🔑 ARGENTUM: Token preview:', token.substring(0, 30) + '...');
  
  try {
    // Create a fresh Supabase client for each request
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    console.log('🔧 ARGENTUM: Creating Supabase client for auth...');
    
    // Just create a simple client - don't set the token in global headers
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Pass the token directly to getUser
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error("❌ ARGENTUM Auth verification failed:", error.message);
      console.error("❌ Error details:", JSON.stringify(error, null, 2));
      
      // Provide more specific error messages
      if (error.message?.includes('expired') || error.message?.includes('JWT')) {
        throw new Error('JWT expired - Your session has expired. Please sign in again.');
      }
      throw new Error(`Invalid JWT: ${error.message}`);
    }
    
    if (!user) {
      console.error("❌ ARGENTUM Auth verification failed: No user found for token");
      throw new Error("Unauthorized - No user found");
    }
    
    console.log("✅ ARGENTUM Auth verification successful for user:", user.id);
    console.log("✅ User email:", user.email);
    return user.id;
  } catch (err) {
    console.error("❌ ARGENTUM: Exception during auth verification:", err);
    throw err;
  }
}

// ============================================================================
// SURFACE ENDPOINTS (Single, Temporary, Flat)
// ============================================================================

/**
 * GET /surface - Get current surface
 */
app.get("/surface", async (c) => {
  try {
    const userId = await getUserId(c);
    const surfaceKey = `argentum:surface:${userId}`;
    
    const surface = await kv.get(surfaceKey);
    
    return c.json({
      surface: surface || null,
    });
  } catch (error: any) {
    console.error("Get surface error:", error);
    return c.json({ error: error.message || "Failed to get surface" }, error.message === "Not authenticated" || error.message.includes("Authentication failed") ? 401 : 500);
  }
});

/**
 * PUT /surface - Update surface content
 */
app.put("/surface", async (c) => {
  try {
    const userId = await getUserId(c);
    const { content } = await c.req.json();
    
    const surfaceKey = `argentum:surface:${userId}`;
    const now = new Date().toISOString();
    
    // Get existing surface or create new
    const existing = await kv.get(surfaceKey);
    
    // Check if locked
    if (existing?.isLocked) {
      // Locked surfaces don't expire
      var expiresAt = null;
    } else {
      // Set expiry to 30 minutes from now
      var expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    }
    
    const surface = {
      id: existing?.id || `surface_${Date.now()}`,
      userId,
      content,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      expiresAt,
      isLocked: existing?.isLocked || false,
    };
    
    await kv.set(surfaceKey, surface);
    
    return c.json({ surface });
  } catch (error: any) {
    console.error("Update surface error:", error);
    return c.json({ error: error.message || "Failed to update surface" }, error.message === "Not authenticated" || error.message.includes("Authentication failed") ? 401 : 500);
  }
});

/**
 * DELETE /surface - Clear surface
 */
app.delete("/surface", async (c) => {
  try {
    const userId = await getUserId(c);
    const surfaceKey = `argentum:surface:${userId}`;
    
    await kv.del(surfaceKey);
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Delete surface error:", error);
    return c.json({ error: error.message || "Failed to delete surface" }, error.message === "Not authenticated" || error.message.includes("Authentication failed") ? 401 : 500);
  }
});

/**
 * GET /surface/export - Export surface as text
 */
app.get("/surface/export", async (c) => {
  try {
    const userId = await getUserId(c);
    const surfaceKey = `argentum:surface:${userId}`;
    
    const surface = await kv.get(surfaceKey);
    
    if (!surface) {
      return c.json({ error: "No surface found" }, 404);
    }
    
    return c.json({
      export: surface.content || "",
    });
  } catch (error: any) {
    console.error("Export surface error:", error);
    return c.json({ error: error.message || "Failed to export surface" }, error.message === "Not authenticated" || error.message.includes("Authentication failed") ? 401 : 500);
  }
});

/**
 * POST /surface/lock - Lock/unlock surface
 */
app.post("/surface/lock", async (c) => {
  try {
    const userId = await getUserId(c);
    const { lock } = await c.req.json();
    
    const surfaceKey = `argentum:surface:${userId}`;
    const surface = await kv.get(surfaceKey);
    
    if (!surface) {
      return c.json({ error: "No surface found" }, 404);
    }
    
    const now = new Date().toISOString();
    
    const updatedSurface = {
      ...surface,
      isLocked: lock,
      updatedAt: now,
      expiresAt: lock ? null : new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
    
    await kv.set(surfaceKey, updatedSurface);
    
    return c.json({ surface: updatedSurface });
  } catch (error: any) {
    console.error("Lock surface error:", error);
    return c.json({ error: error.message || "Failed to lock surface" }, error.message === "Not authenticated" || error.message.includes("Authentication failed") ? 401 : 500);
  }
});

// ============================================================================
// CLEANUP - Check for expired surfaces
// ============================================================================

/**
 * POST /cleanup - Check and delete expired surfaces
 */
app.post("/cleanup", async (c) => {
  try {
    const now = new Date().getTime();
    const surfaces = await kv.getByPrefix("argentum:surface:");
    
    let deletedCount = 0;
    
    for (const surface of surfaces) {
      if (surface.expiresAt && !surface.isLocked) {
        const expiry = new Date(surface.expiresAt).getTime();
        if (now > expiry) {
          await kv.del(`argentum:surface:${surface.userId}`);
          deletedCount++;
        }
      }
    }
    
    return c.json({
      success: true,
      deletedCount,
    });
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return c.json({ error: error.message || "Cleanup failed" }, 500);
  }
});

export default app;