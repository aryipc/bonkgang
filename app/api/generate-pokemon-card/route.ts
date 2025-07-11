
import { GoogleGenAI } from "@google/genai";
import { type NextRequest } from "next/server";
import { readStats, writeStats, readIpUsage, writeIpUsage, type IpUsage } from "@/app/api/lib/db";

function getArtworkPrompt(style: string, characterDescription: string, itemCount: number, testWeaponId?: string): string {
    const baseEnding = `Its appearance, clothing, accessories, personality, and background should be directly inspired by this detailed description: "${characterDescription}".
If the description mentions specific text on clothing, you MUST attempt to render that text clearly on the character's attire.
CRITICAL: The final image should not have any watermarks, borders, or logos that are not part of the described scene or clothing.`;

    // Helper to get a random element from a weighted array.
    const getWeightedRandomElement = <T>(items: T[]): T | undefined => {
        if (!items || items.length === 0) return undefined;
        // This function now assumes items have a 'weight' property.
        const totalWeight = items.reduce((sum, item: any) => sum + item.weight, 0);
        if (totalWeight <= 0) return undefined;

        let random = Math.random() * totalWeight;

        for (const item of items) {
            if (random < (item as any).weight) {
                return item;
            }
            random -= (item as any).weight;
        }
        return items[items.length - 1];
    };
    
    // --- WEAPON LOGIC ---
    let weaponInstruction = '';

    type Weapon = { single: string; plural: string; };
    type WeaponDefinition = { value: Weapon; weight: number; id: string };
    type WeightedWeaponList = WeaponDefinition[];

    const weapons: { [key: string]: WeightedWeaponList } = {
        hung_hing: [
            { id: 'cleaver', value: { single: "a Chinese cleaver (西瓜刀)", plural: "Chinese cleavers (西瓜刀)" }, weight: 30 },
            {
                id: 'pipe',
                value: {
                    single: "a heavy, slightly bent, rusty metal pipe, held like a club",
                    plural: "two heavy, slightly bent, rusty metal pipes, held like clubs"
                },
                weight: 20
            },
            {
                id: 'folding_knife',
                value: {
                    single: "a tactical folding knife with a partially serrated blade, held open in a firm grip",
                    plural: "two tactical folding knives with partially serrated blades, held open one in each hand"
                },
                weight: 20
            },
            {
                id: 'axe',
                value: {
                    single: "a small hand axe or hatchet with a worn wooden handle",
                    plural: "two small hand axes or hatchets with worn wooden handles"
                },
                weight: 20
            },
            { 
                id: 'dragon_staff',
                value: {
                    single: "a short, heavy truncheon or baton, intricately carved to look like a Chinese dragon. The head of the dragon forms the tip of the weapon, and its tail is the handle. The weapon MUST BE short, about the length of a forearm, and held in one hand like a club.",
                    plural: "two short, heavy truncheons or batons, intricately carved to look like Chinese dragons. The head of each dragon forms the tip of the weapon, and its tail is the handle. The weapons MUST BE short, about the length of a forearm, and held one in each hand like clubs." 
                },
                weight: 10
            }
        ],
        street_gang: [
            { id: 'handgun', value: { single: "a handgun", plural: "handguns" }, weight: 50 },
            { id: 'rifle', value: { single: "a rifle", plural: "rifles" }, weight: 25 },
            { id: 'shotgun', value: { single: "a shotgun", plural: "shotguns" }, weight: 25 }
        ],
        og_bonkgang: [
            { id: 'bat', value: { single: "a large wooden baseball bat", plural: "large wooden baseball bats" }, weight: 50 },
            { id: 'spiky_bat', value: { single: "a large wooden baseball bat with sharp metal spikes protruding from it", plural: "large wooden baseball bats with sharp metal spikes protruding from them" }, weight: 30 },
            { 
                id: 'balloon_bat', 
                value: { 
                    single: "a large wooden baseball bat with sharp metal spikes. One spike has pierced and shredded a green and white pill-shaped balloon, which is now completely deflated and draped limply over the spike.",
                    plural: "large wooden baseball bats with sharp metal spikes. On each bat, a spike has pierced and shredded a green and white pill-shaped balloon, which are now completely deflated and draped limply over the spikes."
                }, 
                weight: 20 
            },
        ],
    };

    const selectedWeaponSet = weapons[style as keyof typeof weapons] || weapons['og_bonkgang'];
    
    let selectedWeaponDefinition;
    if (testWeaponId) {
        // If a test weapon is specified, find it directly.
        selectedWeaponDefinition = selectedWeaponSet.find(w => w.id === testWeaponId);
    } else {
        // Otherwise, get a random one.
        selectedWeaponDefinition = getWeightedRandomElement(selectedWeaponSet);
    }
    
    const randomWeapon = selectedWeaponDefinition?.value;

    if (randomWeapon) {
        // New logic: 0 or 1 item -> 1 weapon. 2 or more items -> 2 weapons.
        if (itemCount <= 1) {
            weaponInstruction = `The character MUST be holding ${randomWeapon.single}.`;
        } else { // 2 or more
            weaponInstruction = `The character MUST be dual-wielding ${randomWeapon.plural}, one in each hand.`;
        }
    } else {
        weaponInstruction = 'The character MUST have empty hands.';
    }

    // --- TATTOO & ACCESSORY LOGIC ---
    let tattooInstruction = '';
    let accessoryInstruction = '';

    const getStreetGangTattoo = (): string => {
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
        return `The character has a prominent tattoo of ${selectedTattoo} directly on the skin of their neck or elbow.`;
    };

    if (style === 'hung_hing') {
        const tattooType = Math.random() < 0.5 ? "a classic Chinese dragon tattoo" : "a fierce tiger tattoo";
        tattooInstruction = `The character has ${tattooType} tattooed directly onto their skin on their chest or arms. The tattoo should be partially visible, peeking out from under their clothing, not printed on it.`;
    }

    if (style === 'street_gang') {
        let hasTattoo = false;
        let hasAccessory = false;
        
        if (Math.random() < 0.8) {
            tattooInstruction = getStreetGangTattoo();
            hasTattoo = true;
        }

        if (Math.random() < 0.7) {
            const accessoryOptions = [
                "a large, ostentatious dollar-sign necklace",
                "a thick chain with a large handgun pendant",
                "a prominent necklace with a large religious symbol (like a cross)"
            ];
            const selectedAccessory = accessoryOptions[Math.floor(Math.random() * accessoryOptions.length)];
            accessoryInstruction = `The character is wearing ${selectedAccessory}.`;
            hasAccessory = true;
        }

        if (!hasTattoo && !hasAccessory) {
            tattooInstruction = getStreetGangTattoo();
        }
    }


    switch (style) {
        case 'hung_hing':
            return `Masterpiece, in the high-contrast, dynamic ink wash style of a gritty Hong Kong martial arts comic (港漫).
The artwork MUST feature heavy, expressive black ink work, dramatic chiaroscuro lighting, and a raw, edgy aesthetic.
Create an anthropomorphic dog character.
${weaponInstruction}
${tattooInstruction}
Background: A chaotic, grimy Hong Kong street scene at night, possibly in the rain.
Full body shot, dynamic action pose.
${baseEnding}`;
        case 'street_gang':
            return `Masterpiece, in the distinct style of classic 90s American comic book art (美漫风).
The artwork MUST feature bold, clean black outlines, a palette of flat colors with minimal gradients (cel-shading), and a high-energy composition.
Create an anthropomorphic dog character.
${weaponInstruction}
${tattooInstruction}
${accessoryInstruction}
Background: A gritty, urban alleyway with graffiti and urban decay.
Full body shot, dynamic action pose.
${baseEnding}`;
        case 'og_bonkgang':
        default:
            return `Masterpiece, in a vibrant and modern Western cartoon style, reminiscent of popular animated TV shows.
The artwork MUST be fun and expressive, with clean lines, bright appealing colors, and a slightly mischievous attitude.
Create an anthropomorphic dog character in the 'Bonk Gang' style.
${weaponInstruction}
Background: A simple, colorful, slightly abstract background that doesn't distract from the character.
Full body shot.
${baseEnding}`;
    }
}


export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  let body;
  try {
      body = await request.json();
  } catch (error) {
      return new Response(JSON.stringify({ message: "Invalid request body." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { prompt: characterDescription, style = 'og_bonkgang', itemCount, testWeaponId } = body;
  const isTestRun = !!testWeaponId;

  if (!characterDescription) {
    return new Response(JSON.stringify({ message: "No prompt provided in the request body." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  if (itemCount === undefined) {
      return new Response(JSON.stringify({ message: "Item count not provided in the request body." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // --- IP Rate Limiting & DB Reads (Skip for test runs) ---
  if (!isTestRun) {
      let ipUsageData;
      let userUsage: IpUsage = { totalSubmissions: 0, submittedGangs: [] };

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

      userUsage = ipUsageData[ip] || { totalSubmissions: 0, submittedGangs: [] };

      if (userUsage.totalSubmissions >= 2) {
          return new Response(
          JSON.stringify({ message: "You can join a maximum of two gangs." }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
          );
      }

      if (userUsage.submittedGangs.includes(style)) {
          return new Response(
          JSON.stringify({ message: "You have already submitted to this gang." }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
      }
  }

  // --- AI Generation ---
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable is not set.");
    return new Response(
        JSON.stringify({ message: "API_KEY environment variable is not set. Please ensure it is configured on the server." }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const imageModel = 'imagen-3.0-generate-002';
    const artworkPrompt = getArtworkPrompt(style, characterDescription, itemCount, testWeaponId);

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

    if (!base64ImageBytes) {
        throw new Error("No artwork was generated by the API.");
    }
      
    const artworkUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
    
    // If it's a test run, return early without writing to DB
    if (isTestRun) {
        return new Response(JSON.stringify({ artworkUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // --- DB Write for production runs ---
    const stats = await readStats();
    stats[style] = (stats[style] || 0) + 1;
    await writeStats(stats);
    
    const ipUsageData = await readIpUsage();
    let userUsage = ipUsageData[ip] || { totalSubmissions: 0, submittedGangs: [] };
    userUsage.totalSubmissions += 1;
    if (!userUsage.submittedGangs.includes(style)) {
        userUsage.submittedGangs.push(style);
    }
    ipUsageData![ip] = userUsage;
    await writeIpUsage(ipUsageData!);
    // --- End DB Write ---

    return new Response(JSON.stringify({ 
        artworkUrl,
        newStats: stats,
        newIpStatus: userUsage
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error in Bonk Gang image generation process:", error);
    let message = "An unknown error occurred during generation.";
    if (error instanceof Error) {
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
