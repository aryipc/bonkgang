
import { GoogleGenAI } from "@google/genai";

// Helper to convert a file to a GoogleGenerativeAI.Part object.
async function fileToGenerativePart(file: File) {
    const buffer = Buffer.from(await file.arrayBuffer());
    return {
        inlineData: {
            data: buffer.toString("base64"),
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

    // The vision prompt to generate a character description from the image.
    const visionPrompt = `Analyze this image and create a detailed description of the character and their surroundings.
- Describe the character's physical appearance, clothing (including colors), and accessories.
- Note their overall personality, mood, or vibe.
- If there is any text on their clothing or accessories, quote it exactly.
- Describe the background scene in detail.
CRITICAL: Do NOT mention any weapons, tools, or items the character might be holding. Describe only the character and background.
Example: "A cheerful character with spiky blue hair, wearing a red jacket and sunglasses. Their shirt says 'COOL' in yellow letters. They are standing in front of a futuristic cityscape at night."`;

    const response = await ai.models.generateContent({
        model: visionModel,
        contents: {
            parts: [
                { text: visionPrompt },
                imagePart,
            ],
        },
    });
    
    const description = response.text?.trim() ?? "";

    if (description) {
      return new Response(JSON.stringify({ description }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error("The AI failed to generate a description.");
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