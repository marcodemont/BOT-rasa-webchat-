import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

/**
 * Get last used email for this IP
 * GET /auth/last-email
 */
app.get("/last-email", async (c) => {
  try {
    // Get client IP address
    const clientIP = c.req.header('x-forwarded-for') 
      || c.req.header('x-real-ip') 
      || 'unknown';
    
    console.log(`Fetching last email for IP: ${clientIP}`);
    
    // Fetch from KV store
    const key = `auth:last-email:${clientIP}`;
    const result = await kv.get(key);
    
    if (result) {
      console.log(`Found last email for IP ${clientIP}: ${result}`);
      return c.json({ email: result, ip: clientIP });
    }
    
    console.log(`No last email found for IP ${clientIP}`);
    return c.json({ email: null, ip: clientIP });
  } catch (error) {
    console.error("Error fetching last email:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Failed to fetch last email" 
    }, 500);
  }
});

/**
 * Save last used email for this IP
 * POST /auth/last-email
 * Body: { email: string }
 */
app.post("/last-email", async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email || typeof email !== 'string') {
      return c.json({ error: "Email is required" }, 400);
    }
    
    // Get client IP address
    const clientIP = c.req.header('x-forwarded-for') 
      || c.req.header('x-real-ip') 
      || 'unknown';
    
    console.log(`Saving last email for IP ${clientIP}: ${email}`);
    
    // Save to KV store
    const key = `auth:last-email:${clientIP}`;
    await kv.set(key, email);
    
    console.log(`Successfully saved email for IP ${clientIP}`);
    return c.json({ success: true, email, ip: clientIP });
  } catch (error) {
    console.error("Error saving last email:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Failed to save last email" 
    }, 500);
  }
});

export default app;
