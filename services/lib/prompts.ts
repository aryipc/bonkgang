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


export const generateStylePrompt = (style: string): string => {
    const styleInstruction = getStyleDescription(style);
    const weaponInstruction = getWeaponInstruction(style);

    return `${styleInstruction} ${weaponInstruction}`;
}
