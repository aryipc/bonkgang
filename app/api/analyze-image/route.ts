
import { GoogleGenAI, Type } from "@google/genai";

async function fileToGenerativePart(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    // When running in an environment where 'Buffer' is not available (like some edge runtimes),
    // we need an alternative way to convert the file to a base64 string.
    // The `btoa` function is a standard way to do this.
    // First, we convert the ArrayBuffer to a binary string.
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }
    
    return {
        inlineData: {
            data: btoa(binaryString),
            mimeType: file.type,
        },
    };
}

export async function POST(request: Request) {
  // 1. Check for API Key
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable is not set.");
    return new Response(
        JSON.stringify({ message: "The service is temporarily unavailable. Please try again later." }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const visionModel = 'gemini-2.5-flash';

  // 2. Extract image from the request
  let imageFile: File | null = null;
  try {
    const formData = await request.formData();
    imageFile = formData.get('image') as File | null;
    if (!imageFile) {
        throw new Error("No image file found in the request.");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid form data.";
    return new Response(JSON.stringify({ message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // 3. Run the AI analysis logic
  try {
    const imagePart = await fileToGenerativePart(imageFile);

    // The vision prompt to generate a prompt suitable for GPT-4o.
    const visionPrompt = `Analyze the provided image and generate a detailed, high-quality image generation prompt suitable for a model like GPT-4o or DALL-E 3.

The prompt should be a single block of text, structured as a series of descriptive, comma-separated clauses. It should be concise yet comprehensive, ideally between 50 and 80 words.

Follow this structure for the content of the prompt:
1.  **Primary Subject:** Start with the main subject (e.g., "An anthropomorphic dog").
2.  **Appearance & Attire:** Describe its key features, clothing, and colors (e.g., "with brown fur, wearing a black leather jacket and a yellow baseball cap").
3.  **Action & Pose:** Describe what the subject is doing and its pose (e.g., "confidently holding a wooden baseball bat with spikes, standing in a dynamic action pose").
4.  **Key Accessories:** Mention any important accessories or items. If text is visible on clothing, include it in quotes (e.g., "wearing a gold chain necklace, jacket has 'GANG' written on the back").
5.  **Art Style:** Define the overall artistic style (e.g., "Digital art, American comic book style (美漫风), bold outlines, cel-shading").
6.  **Background & Lighting:** Briefly describe the setting and lighting (e.g., "in a dark alley with neon signs, dramatic backlighting").

Combine these elements into one cohesive prompt string. The entire response from you MUST be a single JSON object with one key: "prompt".

Example of the final JSON output I expect from you:
{"prompt": "An anthropomorphic dog with brown fur, wearing a black leather jacket and a yellow baseball cap, confidently holding a wooden baseball bat with spikes, standing in a dynamic action pose. Digital art, American comic book style (美漫风), bold outlines, cel-shading, in a dark alley with neon signs, dramatic backlighting."}`;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            prompt: {
                type: Type.STRING,
                description: "A detailed image generation prompt suitable for GPT-4o, formatted as a single block of text with comma-separated clauses."
            }
        }
    };

    const response = await ai.models.generateContent({
        model: visionModel,
        contents: [
            { text: visionPrompt },
            imagePart,
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });
    
    if (!response.text) {
        throw new Error("The AI response was empty. Unable to parse content.");
    }

    const result = JSON.parse(response.text.trim());

    if (result && result.prompt) {
      // The frontend service expects a 'description' field.
      const finalResponse = { description: result.prompt };
      return new Response(JSON.stringify(finalResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error("The AI failed to generate a valid prompt in the expected format.");
    }
  } catch (error) {
    console.error("Error in image analysis process:", error);
    let message = "An unknown error occurred during analysis.";
    if (error instanceof Error) {
        // Check for specific Google API key error
        if (error.message.includes("API_KEY_INVALID")) {
            message = "The configured API key is invalid. Please check the API_KEY environment variable on the server.";
        } else {
            message = `The API failed to process the request: ${error.message}`;
        }
    }
    return new Response(
        JSON.stringify({ message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}