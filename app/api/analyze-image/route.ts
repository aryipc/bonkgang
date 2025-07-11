



import { GoogleGenAI, Type } from "@google/genai";

async function fileToGenerativePart(file: File) {
    const arrayBuffer = await file.arrayBuffer();
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

const getStyleDescription = (style: string): string => {
    switch (style) {
        case 'hung_hing':
            return "The art style must be a gritty Hong Kong comic book style. It should feature detailed, high-contrast ink work and dynamic action. While the mood is gritty, ensure the lighting is balanced and the subject is clearly visible, avoiding overly dark shadows that obscure details. The background should be a moody, urban Hong Kong scene like a rain-slicked alley, illuminated by vibrant neon signs that provide clear light sources.";
        case 'street_gang':
            return "The art style must be a classic American comic book style, with bold lines, cel-shading, dynamic action poses, and a slightly gritty feel reminiscent of 90s comics. The background should be a gritty urban environment like a graffiti-covered wall or a street corner under the glow of streetlights.";
        case 'og_bonkgang':
        default:
            return "The art style must be a fun, expressive cartoon style, similar to modern animated shows, in the 'Bonk Gang' aesthetic. The background should be simple and colorful to complement the playful character style.";
    }
};

const getWeaponInstruction = (style: string): string => {
    const getWeightedRandomElement = <T>(items: { value: T; weight: number }[]): T | undefined => {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        if (totalWeight <= 0) return undefined;
        let random = Math.random() * totalWeight;
        for (const item of items) {
            if (random < item.weight) return item.value;
            random -= item.weight;
        }
        return items[items.length - 1]?.value;
    };

    const weapons: { [key: string]: { value: string; weight: number; }[] } = {
        hung_hing: [
            { value: "a Chinese cleaver", weight: 50 },
            { value: "a green glass beer bottle, held by the neck like a knife", weight: 40 },
            { value: "a powerful, dark ceremonial dragon staff, intricately carved with Chinese dragon heads", weight: 10 }
        ],
        street_gang: [
            { value: "a handgun", weight: 50 },
            { value: "a rifle", weight: 25 },
            { value: "a shotgun", weight: 25 }
        ],
        og_bonkgang: [
            { value: "a large wooden baseball bat", weight: 50 },
            { value: "a large wooden baseball bat with sharp metal spikes protruding from it", weight: 30 },
            { value: "a large wooden baseball bat with sharp metal spikes and a deflated, green and white pill-shaped balloon tied to its handle", weight: 20 },
        ],
    };

    const selectedWeaponSet = weapons[style] || weapons['og_bonkgang'];
    const randomWeapon = getWeightedRandomElement(selectedWeaponSet);

    return randomWeapon ? `The character MUST be holding or wielding ${randomWeapon}.` : 'The character MUST have empty hands.';
};


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

  // 2. Extract image and style from the request
  let imageFile: File | null = null;
  let style: string = 'og_bonkgang';
  try {
    const formData = await request.formData();
    imageFile = formData.get('image') as File | null;
    style = (formData.get('style') as string) || 'og_bonkgang';

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
    const styleInstruction = getStyleDescription(style);
    const weaponInstruction = getWeaponInstruction(style);

    const visionPrompt = `You are an expert prompt writer for AI image generation models like GPT-4o. A user has uploaded an image and selected a specific artistic style: "${style}".
Your task is to analyze the image and generate a detailed, high-quality prompt that combines the visual elements of the image with the required artistic style and a specific weapon.

**WEAPON REQUIREMENT:**
${weaponInstruction}

**STYLE GUIDELINES FOR "${style}":**
${styleInstruction}

**PROMPT GENERATION RULES:**
1.  The final prompt must be a single, comma-separated string.
2.  It must be between 50 and 80 words.
3.  It MUST incorporate the key visual details from the user's image (the main subject, its clothing, colors, pose, and important accessories).
4.  It MUST incorporate the weapon described in the "WEAPON REQUIREMENT" section.
5.  It MUST explicitly define the art style according to the guidelines above. The background and lighting described should also match the chosen style's mood.

**STRUCTURE EXAMPLE:**
"An anthropomorphic dog with brown fur, wearing a black leather jacket, confidently holding a baseball bat, standing in a dynamic pose, in a gritty Hong Kong comic book style, dramatic shadows, set in a rain-slicked Kowloon alley at night."

The entire response from you MUST be a single JSON object with one key: "prompt".`;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            prompt: {
                type: Type.STRING,
                description: `A detailed image generation prompt for the ${style} style, suitable for GPT-4o, formatted as a single block of text with comma-separated clauses.`
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
      return new Response(JSON.stringify(result), {
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