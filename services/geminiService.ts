import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getStyleAdvice = async (userDescription: string): Promise<string> => {
  if (!apiKey) {
    // Fallback for demo/no-key environment
    return `**Style:** Modern Organic\n**Palette:** Warm Beige, Sage Green, Charcoal, Terracotta\n**Advice:** Focus on natural materials like wood and stone mixed with clean lines. Layer textures (jute, linen, wool) to add warmth without clutter. Use plants as living sculptural elements.`;
  }

  try {
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
    
    // Enhanced prompt with spatial data
    const dimensionText = dimensions ? `in a ${dimensions.width}x${dimensions.depth} foot room` : 'in a spacious room';
    
    const prompt = `Photorealistic interior design render of a ${style} room ${dimensionText}. 
    The room contains: ${items.join(', ')}. 
    Ensure the furniture arrangement respects the room scale. 
    Cinematic lighting, 8k resolution, architectural digest style photography.`;
    
    try {
        // NOTE: In a real app we'd use 'imagen-3.0-generate-001' or similar. 
        // For this demo, we will use a high-quality Unsplash placeholder.
        return "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=2000"; 
    } catch (e) {
        return "";
    }
}