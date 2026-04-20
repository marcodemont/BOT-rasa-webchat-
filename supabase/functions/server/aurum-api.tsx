/**
 * POST /sheets - Create new sheet
 */
aurumApp.post("/sheets", async (c) => {
  try {
    console.log('📝 POST /sheets - Create new sheet request received');
    
    const userId = await verifyAuth(c.req.header("Authorization"));
    console.log('✅ User authenticated:', userId);
    
    const body = await c.req.json();
    console.log('📄 Request body:', body);
    
    const sheetId = generateId();
    const now = new Date().toISOString();
    
    const sheet = {
      id: sheetId,
      userId,
      title: body.title || "Untitled Sheet",
      createdAt: now,
      updatedAt: now,
      layerIds: [],
      isArchived: false,
      metadata: body.metadata || {}
    };
    
    console.log('💾 Saving sheet:', sheet);
    
    // Save sheet
    await kv.set(`sheet:${userId}:${sheetId}`, sheet);
    console.log('✅ Sheet saved to KV store');
    
    // Update user's sheet list
    const userSheets = await kv.get(`user-sheets:${userId}`) || [];
    console.log('📋 Current user sheets:', userSheets);
    
    userSheets.push(sheetId);
    await kv.set(`user-sheets:${userId}`, userSheets);
    console.log('✅ User sheet list updated');
    
    console.log('🎉 Sheet created successfully:', sheetId);
    return c.json({ sheet }, 201);
  } catch (error) {
    console.error("❌ Error creating sheet:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error occurred' }, 500);
  }
});