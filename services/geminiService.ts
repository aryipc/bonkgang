

export interface StyleStats {
  og_bonkgang: number;
  hung_hing: number;
  street_gang: number;
}

export interface IpStatus {
  submittedGangs: string[];
  totalSubmissions: number;
}

export interface ImageGenerationResult {
  artworkUrl: string;
  newStats?: StyleStats;
  newIpStatus?: IpStatus;
}

export interface ImageAnalysisResult {
  description: string;
  itemCount: number;
}

export async function getStats(): Promise<StyleStats> {
  const response = await fetch('/api/stats');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'The server returned an invalid response.' }));
    throw new Error(errorData.message || `Server error: ${response.status}`);
  }
  return await response.json();
}

export async function analyzeImage(imageFile: File): Promise<ImageAnalysisResult> {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'The server returned an invalid response.' }));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const result: ImageAnalysisResult = await response.json();
    if (!result.description || result.itemCount === undefined) {
      throw new Error("The server response was incomplete.");
    }
    return result;
  } catch (error) {
    console.error("Error calling analysis service:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown network error occurred during analysis.");
  }
}

export async function generateBonkImage(prompt: string, style: string, itemCount: number, testWeaponId?: string): Promise<ImageGenerationResult> {
  try {
    const payload: { [key: string]: any } = { prompt, style, itemCount };
    if (testWeaponId) {
      payload.testWeaponId = testWeaponId;
    }

    const response = await fetch('/api/generate-pokemon-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'The server returned an invalid response.' }));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const result: ImageGenerationResult = await response.json();
    if (!result.artworkUrl) {
        throw new Error("The server response did not contain the generated artwork URL.");
    }
    return result;
  } catch (error) {
    console.error("Error calling generation service:", error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("An unknown network error occurred during generation.");
  }
}