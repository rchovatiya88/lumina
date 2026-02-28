import { GoogleGenAI } from "@google/genai";

// Support both Vite (import.meta.env) and standard process.env
const apiKey = (import.meta.env?.VITE_GEMINI_API_KEY) || (process?.env?.API_KEY) || '';

// Lazy initialization or null if no key
const getAiClient = () => {
  if (!apiKey) return null;
  return new GoogleGenAI({apiKey});
};

export const getStyleAdvice = async (userDescription: string): Promise<string> => {
  if (!apiKey) {
    // Fallback for demo/no-key environment
    return `**Style:** Modern Organic\n**Palette:** Warm Beige, Sage Green, Charcoal, Terracotta\n**Advice:** Focus on natural materials like wood and stone mixed with clean lines. Layer textures (jute, linen, wool) to add warmth without clutter. Use plants as living sculptural elements.`;
  }

  try {
    const ai = getAiClient();
    if (!ai) throw new Error("No API Client");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a high-end interior designer assistant. 
      Analyze the following user preference and provide a short, punchy paragraph (max 80 words) describing their design style (e.g., Mid-Century Modern, Scandi-Boho) and a suggested color palette (3-4 colors).
      
      User Input: "${userDescription}"
      
      Output format: 
      **Style:** [Style Name]
      **Palette:** [Color 1, Color 2, Color 3]
      **Advice:** [Brief advice]
      `,
    });
    return response.text || "Could not generate advice at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while analyzing your style. Please try again later.";
  }
};

export const generateRoomLayoutIdeas = async (items: string[]): Promise<string> => {
    if (!apiKey) {
         return `**Designer Tip:** With your current selection of ${items.slice(0, 3).join(', ')}, try floating the seating arrangement in the center of the room rather than pushing everything against the walls. This creates a more intimate conversation area and improves flow.`;
    }
    try {
      const ai = getAiClient();
      if (!ai) throw new Error("No API Client");
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `I have these furniture items in a room: ${items.join(', ')}. 
            Suggest a professional room layout description in 2-3 short bullet points focusing on traffic flow and aesthetic balance. Be specific about where to place the ${items[0] || 'furniture'}.`
        });
        return response.text || "No layout generated.";
    } catch (e) {
        console.error(e);
        return "Unable to generate layout advice at this moment.";
    }
}

export const analyzeRoomImage = async (base64Image: string): Promise<{style: string, items: string[], colors: string[]}> => {
  // Removes the data:image/png;base64, prefix
  const base64Data = base64Image.split(',')[1];
  
  if (!apiKey) {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
          style: 'Contemporary Minimalist',
          items: ['Sofa', 'Floor Lamp', 'Coffee Table', 'Rug'],
          colors: ['#F5F5F4', '#57534E', '#D6D3D1']
      };
  }

  try {
    const ai = getAiClient();
    if (!ai) throw new Error("No API Client");
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image', // Specialized for vision
          contents: {
              parts: [
                  { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                  { text: 'Analyze this room. Return a JSON object with 3 keys: "style" (string, e.g. Modern), "items" (array of strings, potential furniture to add), and "colors" (array of hex strings, suggested palette).' }
              ]
          }
      });
      
      const text = response.text || "{}";
      // Extract JSON from potential markdown code block
      const jsonString = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonString);
  } catch (e) {
      console.error("Vision Analysis Failed", e);
      return {
        style: 'Modern',
        items: ['Chair', 'Table'],
        colors: ['#cccccc']
      };
  }
}

export const generateRoomRender = async (items: string[], style: string, dimensions?: {width: number, depth: number}): Promise<string> => {
    if (!apiKey) return "";
    
  // If no dimensions provided, assume we are in "Moodboard Mode"
  const context = dimensions
    ? `in a ${dimensions.width}x${dimensions.depth} foot room`
    : 'based on a creative moodboard composition';
    
  const prompt = `Photorealistic 8k interior design render. 
    Style: ${style}.
    Scene Description: A fully realized room ${context}.
    Featured Furniture: ${items.join(', ')}. 
    
    Instructions: 
    - Harmoniously arrange these specific furniture items into a livable, beautiful scene.
    - If items are mismatched, unify them with lighting and compatible decor.
    - Cinematic lighting, architectural digest photography.`;
    
    try {
        // NOTE: In a real app we'd use 'imagen-3.0-generate-001' or similar. 
        // For this demo, we will use a high-quality Unsplash placeholder.
        return "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=2000"; 
    } catch (e) {
        return "";
    }
}

export const analyzeFurnitureImage = async (base64Image: string): Promise<Partial<import('../types').Product>> => {
  const base64Data = base64Image.split(',')[1];

  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      name: "Vintage Velvet Armchair",
      category: 'chair',
      style: 'mid-century modernish' as any,
      description: "A beautiful teal velvet armchair with tapered wooden legs.",
      colors: ['#008080', '#8b4513'],
      dimensions: {width: 32, depth: 34, height: 38},
      price: 0,
      store: 'Uploaded'
    };
  }

  try {
    const ai = getAiClient();
    if (!ai) throw new Error("No API Client");
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          {inlineData: {mimeType: 'image/jpeg', data: base64Data}},
          {
            text: `Analyze this furniture item. Extract these details into a JSON object:
                  - name: A short descriptive name (e.g. "Tufted Leather Sofa")
                  - category: one of ['sofa', 'chair', 'table', 'lamp', 'decor', 'rug', 'bed', 'storage']
                  - style: one of ['modern', 'boho', 'industrial', 'classic', 'scandi', 'glam', 'contemporary', 'rustic', 'minimalist']
                  - dimensions: Best guess estimation in inches {width, depth, height}. Standard sofa is ~84" wide. Standard chair ~30" wide. Be realistic.
                  - start_color: Main hex color code
                  - description: 1 sentence description
                  ` }
        ]
      }
    });

    const text = response.text || "{}";
    const jsonString = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(jsonString);

    return {
      name: data.name || "Unknown Item",
      category: (data.category || 'decor').toLowerCase(),
      style: (data.style || 'modern').toLowerCase(),
      dimensions: data.dimensions || {width: 24, depth: 24, height: 24},
      description: data.description,
      price: 0,
      store: 'Uploaded',
      colors: data.start_color ? [data.start_color] : []
    };
  } catch (e) {
    console.error("Furniture Analysis Failed", e);
    return {
      name: "Scanned Item",
      category: 'decor',
      dimensions: {width: 24, depth: 24, height: 24}
    };
  }
}