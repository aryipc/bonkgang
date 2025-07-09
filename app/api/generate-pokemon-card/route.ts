
import { GoogleGenAI } from "@google/genai";
import { promises as fs } from 'fs';
import path from 'path';

// --- Database Functions ---
const dbPath = path.join('/tmp', 'db.json');

type Stats = {
    [key: string]: number;
};

async function readStats(): Promise<Stats> {
    try {
        await fs.access(dbPath); // Check if file exists
        const data = await fs.readFile(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or is invalid, return default stats and create it
        const defaultStats: Stats = { og_bonkgang: 0, hung_hing: 0, street_gang: 0 };
        await writeStats(defaultStats);
        return defaultStats;
    }
}

async function writeStats(stats: Stats): Promise<void> {
    await fs.writeFile(dbPath, JSON.stringify(stats, null, 2), 'utf8');
}
// --- End Database Functions ---


function getArtworkPrompt(style: string, characterDescription: string, itemCount: number): string {
    const baseEnding = `Its appearance, clothing, accessories, personality, and background should be directly inspired by this detailed description: "${characterDescription}".
If the description mentions specific text on clothing, you MUST attempt to render that text clearly on the character's attire.
CRITICAL: The final image should not have any watermarks, borders, or logos that are not part of the described scene or clothing.`;

    // Helper to get a random element from a weighted array.
    const getWeightedRandomElement = <T>(items: { value: T; weight: number }[]): T | undefined => {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        if (totalWeight <= 0) return undefined;

        let random = Math.random() * totalWeight;

        for (const item of items) {
            if (random < item.weight) {
                return item.value;
            }
            random -= item.weight;
        }
        // Fallback for floating point precision issues, though unlikely.
        return items[items.length - 1]?.value;
    };
    
    // --- WEAPON LOGIC ---
    let weaponInstruction = '';

    type Weapon = { single: string; plural: string; };
    type WeightedWeaponList = { value: Weapon; weight: number; }[];

    const weapons: { [key: string]: WeightedWeaponList } = {
        hung_hing: [
            { value: { single: "a Chinese cleaver (西瓜刀)", plural: "Chinese cleavers (西瓜刀)" }, weight: 50 },
            { value: { single: "a green glass beer bottle, held by the neck like a knife", plural: "green glass beer bottles, each held by the neck like a knife" }, weight: 40 },
            { 
                value: {
                    single: "a powerful, dark ceremonial dragon staff or scepter, intricately carved with detailed Chinese dragon heads and scales. Its length is roughly that of a small glass bottle, with the dragon's tail forming the base of the rod.",
                    plural: "powerful, dark ceremonial dragon staves or scepters, intricately carved with detailed Chinese dragon heads and scales. Their length is roughly that of a small glass bottle, with the dragon's tail forming the base of the rod." 
                },
                weight: 10
            }
        ],
        street_gang: [
            { value: { single: "a handgun", plural: "handguns" }, weight: 50 },
            { value: { single: "a rifle", plural: "rifles" }, weight: 25 },
            { value: { single: "a shotgun", plural: "shotguns" }, weight: 25 }
        ],
        og_bonkgang: [
            { value: { single: "a large wooden baseball bat", plural: "large wooden baseball bats" }, weight: 50 },
            { value: { single: "a large wooden baseball bat with sharp metal spikes protruding from it", plural: "large wooden baseball bats with sharp metal spikes protruding from them" }, weight: 30 },
            { value: { single: "a large wooden baseball bat with sharp metal spikes, and a deflated, green and white pill-shaped balloon is tied to its handle", plural: "large wooden baseball bats with sharp metal spikes, and deflated, green and white pill-shaped balloons are tied to their handles" }, weight: 20 },
        ],
    };

    const selectedWeaponSet = weapons[style as keyof typeof weapons] || weapons['og_bonkgang'];
    const randomWeapon = getWeightedRandomElement(selectedWeaponSet);

    if (randomWeapon) {
        // New logic: 0 or 1 item -> 1 weapon. 2 or more items -> 2 weapons.
        if (itemCount <= 1) {
            weaponInstruction = `The character MUST be holding ${randomWeapon.single}.`;
        } else { // 2 or more
            weaponInstruction = `The character MUST be dual-wielding two ${randomWeapon.plural}, one in each hand.`;
        }
    } else {
        // Fallback if no weapon is selected for some reason.
        weaponInstruction = 'The character MUST have empty hands.';
    }

    // --- TATTOO & ACCESSORY LOGIC ---
    let tattooInstruction = '';
    let accessoryInstruction = '';

    if (style === 'hung_hing') {
        // 100% chance of a tattoo, 50/50 split between dragon and tiger.
        const tattooType = Math.random() < 0.5 ? "a classic Chinese dragon tattoo" : "a fierce tiger tattoo";
        tattooInstruction = `The character has ${tattooType} tattooed directly onto their skin on their chest or arms. The tattoo should be partially visible, peeking out from under their clothing, not printed on it.`;
    }

    if (style === 'street_gang') {
        // High chance of getting a tattoo.
        if (Math.random() < 0.8) { // 80% chance
            const tattooOptions = [
                "the word 'CRIPS'",
                "the word 'BLOODS'",
                "the letters 'MS-13'",
                "a spiderweb design",
                "a royal crown",
                "several small stars",
                "a skull"
            ];
            const selectedTattoo = tattooOptions[Math.floor(Math.random() * tattooOptions.length)];
            tattooInstruction = `The character has a prominent tattoo of ${selectedTattoo} directly on the skin of their neck or elbow.`;
        }

        // High chance of getting an accessory.
        if (Math.random() < 0.7) { // 70% chance
            const accessoryOptions = [
                "a large, ostentatious dollar-sign necklace",
                "a thick chain with a large handgun pendant",
                "a prominent necklace with a large religious symbol (like a cross)"
            ];
            const selectedAccessory = accessoryOptions[Math.floor(Math.random() * accessoryOptions.length)];
            accessoryInstruction = `The character is wearing ${selectedAccessory}.`;
        }
    }


    switch (style) {
        case 'hung_hing':
            return `Digital art, masterpiece, gritty Hong Kong comic book style (港漫).
Create an anthropomorphic dog character.
${weaponInstruction}
${tattooInstruction}
Style: dark, intense, dynamic ink work, dramatic shadows, reminiscent of classic triad comics and movies. Full body shot.
${baseEnding}`;
        case 'street_gang':
            return `Digital art, masterpiece, classic American comic book style (美漫风).
Create an anthropomorphic dog character.
${weaponInstruction}
${tattooInstruction}
${accessoryInstruction}
Style: bold lines, cel-shading, dynamic action pose, slightly gritty, reminiscent of 90s American comic books. Full body shot.
${baseEnding}`;
        case 'og_bonkgang':
        default:
            return `Digital art, masterpiece, cartoon style.
Create an anthropomorphic dog character in the 'Bonk Gang' style.
${weaponInstruction}
Style: fun, expressive, full body shot, slightly mischievous, similar to modern animated shows.
${baseEnding}`;
    }
}


// The route is POST /api/generate-pokemon-card, but its function is to generate a Bonk Gang image from a prompt.
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

  // 2. Extract prompt, style, and itemCount from the request
  let characterDescription: string;
  let style: string;
  let itemCount: number;

  try {
    const body = await request.json();
    if (!body.prompt) {
        throw new Error("No prompt provided in the request body.");
    }
    if (body.itemCount === undefined) {
        throw new Error("Item count not provided in the request body.")
    }
    characterDescription = body.prompt;
    style = body.style || 'og_bonkgang'; // Default to og_bonkgang
    itemCount = body.itemCount;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request body.";
    return new Response(JSON.stringify({ message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }


  // 3. Run the AI generation logic
  try {
    const imageModel = 'imagen-3.0-generate-002';
    
    // Generate the new character artwork.
    const artworkPrompt = getArtworkPrompt(style, characterDescription, itemCount);

    const imageResponse = await ai.models.generateImages({
        model: imageModel,
        prompt: artworkPrompt,
        config: { 
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        },
    });

    const base64ImageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;

    if (base64ImageBytes) {
      const artworkUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      
      // --- Update Stats ---
      try {
        const stats = await readStats();
        stats[style] = (stats[style] || 0) + 1;
        await writeStats(stats);
      } catch (dbError) {
        console.error("Failed to update stats DB:", dbError);
        // Do not block the user response for a stats error. Log it and continue.
      }
      // --- End Update Stats ---

      return new Response(JSON.stringify({ artworkUrl }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
      });

    } else {
        throw new Error("No artwork was generated by the API.");
    }
  } catch (error) {
    console.error("Error in Bonk Gang image generation process:", error);
    let message = "An unknown error occurred during generation.";
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
