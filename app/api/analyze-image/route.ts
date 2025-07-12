<<<<<<< HEAD

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
        JSON.stringify({ message: "API_KEY environment variable is not set. Please ensure it is configured on the server." }),
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
    const textPart = {
        text: `Analyze the provided image and return a JSON object.
The JSON object must contain two properties: "description" and "itemCount".

1.  "description": Create a detailed text description focusing ONLY on the character's appearance (species, build, colors), their clothing, and any non-held accessories. Also describe the background scene. If there is any text visible on clothing, quote it exactly.
2.  "itemCount": Count the number of distinct items, tools, or weapons the character is actively holding in their hands. This must be an integer. If they are holding nothing, the value must be 0.

Your entire response must be a single, valid JSON object matching this structure and nothing else. No commentary or markdown formatting.`
    };
    
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
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });
    
    // More robust response validation
    const finishReason = response?.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
      let userMessage = `The AI generation was stopped for an unexpected reason: ${finishReason}.`;
      if (finishReason === 'SAFETY') {
          userMessage = "The request was blocked by the AI's safety filter. Please try using a different image.";
      }
      console.error(`AI analysis stopped. Reason: ${finishReason}. Full response:`, JSON.stringify(response, null, 2));
      throw new Error(userMessage);
    }
    
    if (!response.text) {
        console.error("AI analysis response was empty. Full response:", JSON.stringify(response, null, 2));
        throw new Error("The AI returned an empty response. This can happen with some images; please try another.");
    }
    
    let result;
    try {
        result = JSON.parse(response.text.trim());
    } catch (parseError) {
        console.error("Failed to parse AI JSON response. Raw text:", response.text);
        throw new Error("The AI returned a response in an invalid format.");
    }


    if (result && result.description !== undefined && result.itemCount !== undefined) {
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.error("AI response was missing required JSON fields. Parsed result:", result);
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
            // Use the specific error message from the try block
            message = error.message;
        }
    }
    return new Response(
        JSON.stringify({ message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
=======
export {};
>>>>>>> e2f6cc657ea60c98d5df23db2a89353c6dd5b44d
