import { GoogleGenAI } from "@google/genai";

// This function will be triggered by POST requests to /api/generate-pokemon-card
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
    // In some environments (like Edge Functions), the 'Buffer' object is not available.
    // We can convert the ArrayBuffer to a Base64 string manually.
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

  // 3. Run the AI generation logic
  try {
    const visionModel = 'gemini-2.5-flash';
    const imageModel = 'imagen-3.0-generate-002';

    const imagePart = await fileToGenerativePart(imageFile);

    // Step 1: Generate structured card data using the vision model.
    const promptForVisionModel = `You are a creative assistant that designs Pokémon cards. Analyze the user's image and invent the details for a new Pokémon.

    **YOUR TASK:**
    Based on the image, generate a JSON object with the following structure:
    {
      "subject_description": "A detailed visual description of the main subject in the user's image. For example: 'A cute, small white dog wearing a traditional pink and red floral kimono.'",
      "pokemon_name": "A creative, one- or two-word Pokémon name for the subject. e.g., 'Kimoninu'",
      "hp": "An HP value between 60 and 120. e.g., 70",
      "pokemon_type": "A standard Pokémon type from this list: Grass, Fire, Water, Lightning, Psychic, Fighting, Colorless, Darkness, Metal, Dragon, Fairy. e.g., 'Fairy'",
      "attack_1_name": "Name of a single attack. e.g., 'Charming Gaze'",
      "attack_1_description": "A very short (10-15 words) description of the attack's effect. e.g., 'The opposing Pokémon is now Paralyzed by its cuteness.'",
      "attack_1_damage": "The damage number for the attack (a multiple of 10). e.g., 40",
      "pokedex_entry": "A short, creative Pokédex-style description (15-20 words). e.g., 'This Pokémon is adored for its elegant appearance and gentle nature. It often brings good fortune to its trainer.'"
    }

    **RULES:**
    - All text values in the JSON must be in perfect, correctly-spelled English.
    - The pokemon_type MUST be one of the provided options.
    - Your output MUST be ONLY the JSON object, with no other text, comments, or markdown formatting.`;

    const visionResponse = await ai.models.generateContent({
        model: visionModel,
        contents: { parts: [imagePart, { text: promptForVisionModel }] },
        config: {
            temperature: 0.8,
            responseMimeType: "application/json",
        }
    });

    let jsonStr = visionResponse.text?.trim() ?? "";
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    let cardData;
    try {
        cardData = JSON.parse(jsonStr);
    } catch(e) {
        console.error("Failed to parse JSON from vision model:", jsonStr);
        throw new Error("The AI failed to generate valid card data. Please try again.");
    }
    
    // Step 2: Generate only the Pokémon's artwork using the image model.
    const artworkPrompt = `Masterpiece, professional trading card game art. A portrait-style illustration (3:4 aspect ratio) of the following character: "${cardData.subject_description}".
The character MUST be in the style of a classic Pokémon.
The background should be simple, thematically matching a ${cardData.pokemon_type}-type Pokémon.
The image should be a centered, full-body shot of the character.
Do NOT include any text, borders, or card elements. ONLY the artwork.`;

    const imageResponse = await ai.models.generateImages({
        model: imageModel,
        prompt: artworkPrompt,
        config: { 
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '3:4', // Portrait artwork
        },
    });

    const base64ImageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;

    if (base64ImageBytes) {
      const artworkUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      
      return new Response(JSON.stringify({ cardData, artworkUrl }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
      });

    } else {
        throw new Error("No artwork was generated by the API.");
    }
  } catch (error) {
    console.error("Error in Pokémon card generation process:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred during generation.";
    return new Response(
        JSON.stringify({ message: `The API failed to process the request: ${message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}