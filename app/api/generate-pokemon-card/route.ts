
import { GoogleGenAI } from "@google/genai";
import { type NextRequest } from "next/server";
import { readStats, writeStats, readIpUsage, writeIpUsage, type IpUsage } from "@/app/api/lib/db";

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
            { value: { single: "a green glass beer bottle, held in a reverse grip by its neck with the base of the bottle pointing upwards", plural: "green glass beer bottles, each held in a reverse grip by its neck with the base of the bottle pointing upwards" }, weight: 40 },
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
export async function POST(request: NextRequest) {
  // 1. Extract body and IP
  const ip = request.ip ?? '127.0.0.1';
  let body;
  try {
      body = await request.json();
  } catch (error) {
      return new Response(JSON.stringify({ message: "Invalid request body." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { prompt: characterDescription, style = 'og_bonkgang', itemCount } = body;
  
  if (!characterDescription) {
    return new Response(JSON.stringify({ message: "No prompt provided in the request body." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  if (itemCount === undefined) {
      return new Response(JSON.stringify({ message: "Item count not provided in the request body." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // 2. IP Rate Limiting: Read usage data once and perform checks.
  let ipUsageData;
  try {
    ipUsageData = await readIpUsage();
  } catch (dbError) {
    console.error("Failed to read IP usage DB:", dbError);
    let message = "Service is temporarily unavailable due to a database error.";
    if (dbError instanceof Error && dbError.message.includes('@vercel/kv: Missing required environment variable')) {
        message = "Configuration Error: The application is missing required Vercel KV database environment variables. Please check your project's deployment settings.";
    }
    return new Response(
        JSON.stringify({ message }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const userUsage: IpUsage = ipUsageData[ip] || { totalSubmissions: 0, submittedGangs: [] };

  if (userUsage.totalSubmissions >= 2) {
    return new Response(
      JSON.stringify({ message: "You have reached the maximum number of generations (2)." }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (userUsage.submittedGangs.includes(style)) {
    return new Response(
      JSON.stringify({ message: "You have already submitted to this gang." }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3. Check for API Key
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable is not set.");
    return new Response(
        JSON.stringify({ message: "API_KEY environment variable is not set. Please ensure it is configured on the server." }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 4. Run the AI generation logic
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
      
      // --- Update Stats & IP Usage ---
      try {
        // Update stats
        const stats = await readStats();
        stats[style] = (stats[style] || 0) + 1;
        await writeStats(stats);
        
        // Update the in-memory usage object and write it back to the file
        userUsage.totalSubmissions += 1;
        if (!userUsage.submittedGangs.includes(style)) {
          userUsage.submittedGangs.push(style);
        }
        ipUsageData[ip] = userUsage;
        await writeIpUsage(ipUsageData);

      } catch (dbError) {
        console.error("Failed to update stats/IP DB:", dbError);
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
            message = error.message;
        }
    }
    return new Response(
        JSON.stringify({ message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
