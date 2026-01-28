import { NextRequest, NextResponse } from 'next/server';

const FALLBACK_RESPONSES: Record<string, string> = {
  "book": "To book equipment, navigate to the 'Browse Equipment' tab, search for the item you need, and click the 'Book Now' button.",
  "microscope": "Microscopes are listed under the Optical Instruments category. You can book them in 2-hour slots.",
  "safety": "Please remember to always wear appropriate PPE (lab coat, safety glasses, gloves) when in the laboratory. In case of emergency, locate the nearest eyewash station.",
  "experiment": "You can view available experiment guides in the 'Experiments' tab. Each guide includes required equipment and safety protocols.",
  "default": "I'm currently operating in offline mode. I can help with basic navigation: check the 'Browse' tab for equipment or 'My Bookings' to manage your schedule."
};

function getFallbackResponse(query: string) {
  const lower = query.toLowerCase();
  for (const [key, val] of Object.entries(FALLBACK_RESPONSES)) {
    if (lower.includes(key) && key !== 'default') return val;
  }
  return FALLBACK_RESPONSES.default;
}

async function fetchWithModel(key: string, model: string, contents: any[]) {
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });
}

export async function POST(req: NextRequest) {
  let lastUserMessage = "";
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // Adapt messages for Gemini
    const validMessages = messages
      .filter((m: any) => m.content && m.content.trim() !== '')
      .map((m: any) => ({
        role: m.type === 'bot' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    lastUserMessage = validMessages.filter((m: any) => m.role === 'user').pop()?.parts[0].text || "";

    // If the conversation starts with a bot greeting, remove it because Gemini expects 'user' first
    let contents = validMessages;
    if (contents.length > 0 && contents[0].role === 'model') {
      contents = contents.slice(1);
    }

    if (contents.length === 0) {
      return NextResponse.json({ error: 'No user input to process.' }, { status: 400 });
    }

    // Inject system persona into the first user message
    if (contents[0].role === 'user') {
      const systemContext = "You are a helpful Lab Assistant for a laboratory equipment booking system. Help students and staff with equipment info, safety guidelines, and booking procedures. Be concise and friendly.\n\n";
      contents[0].parts[0].text = systemContext + contents[0].parts[0].text;
    }

    if (!apiKey) {
      throw new Error("Missing API Key");
    }

    // Attempt 1: gemini-flash-latest (Verified working)
    let response = await fetchWithModel(apiKey, 'gemini-flash-latest', contents);

    // Attempt 2: gemini-pro (fallback)
    // Only try if the first one failed with a transient error, but in our testing gemini-pro also failed. 
    // We'll trust flash-latest.

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API Failed (${response.status}): ${errText}`);
      throw new Error(`Gemini API Failed: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (err: any) {
    console.error("AI API Error, using fallback:", err.message);

    // Robust Fallback: Return a valid Gemini-like response so the UI doesn't break
    return NextResponse.json({
      candidates: [{
        content: {
          parts: [{ text: getFallbackResponse(lastUserMessage) }]
        },
        role: "model"
      }]
    });
  }
}
