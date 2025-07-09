import { GoogleGenAI, Type } from "@google/genai";

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
    const visionPrompt = `Analyze this image and provide a JSON object with two keys: "itemCount" and "description".
- "itemCount": An integer representing the number of distinct weapons, tools, or significant items the character is holding in their hands. If they are holding nothing, this should be 0.
- "description": A detailed text description of the character and their surroundings. Describe physical appearance, clothing, accessories, personality, and background. If there is text on clothing, quote it exactly. Do NOT mention any items the character is holding in this description string.`;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            itemCount: { 
                type: Type.INTEGER,
                description: "The number of distinct items/weapons the character is holding."
            },
            description: {
                type: Type.STRING,
                description: "A detailed description of the character and background, excluding any items held."
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
    
    const result = JSON.parse(response.text.trim());

    if (result && result.description !== undefined && result.itemCount !== undefined) {
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error("The AI failed to generate a valid description and item count.");
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