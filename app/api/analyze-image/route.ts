
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  // 1. Check for API Key
  if (!process.env.API_KEY) {
    return new Response(
        JSON.stringify({ message: "API key is not configured on the server." }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 2. Extract image from the request
  let imageFile: File;
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    if (!file || !(file instanceof File)) {
      throw new Error("No image file found in the request.");
    }
    imageFile = file;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request body.";
    return new Response(JSON.stringify({ message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Helper function to convert File to a GoogleGenAI.Part object.
  const fileToGenerativePart = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64EncodedData = btoa(binaryString);
    
    return {
      inlineData: { data: base64EncodedData, mimeType: file.type },
    };
  };

  // 3. Run the AI analysis
  try {
    const visionModel = 'gemini-2.5-flash';
    const imagePart = await fileToGenerativePart(imageFile);

    // Generate a creative description from the user's image.
    const promptForVisionModel = `Analyze the main subject in the user's image. 
    Generate a short, creative description (15-25 words) that captures its essence. 
    Focus on personality, key visual traits, and style. This will be used to inspire a new cartoon character.
    Example: 'A grumpy-looking bulldog with wrinkly cheeks, wearing a small, slightly-too-tight knitted sweater.'`;

    const visionResponse = await ai.models.generateContent({
        model: visionModel,
        contents: { parts: [imagePart, { text: promptForVisionModel }] },
        config: {
            temperature: 0.8,
        }
    });

    const characterDescription = visionResponse.text?.trim();
    
    if (!characterDescription) {
        throw new Error("Failed to generate a description from the image.");
    }

    return new Response(JSON.stringify({ description: characterDescription }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error in image analysis process:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred during analysis.";
    return new Response(
        JSON.stringify({ message: `The API failed to process the request: ${message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
