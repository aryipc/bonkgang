

export interface ImageGenerationResult {
  artworkUrl: string;
}

export interface ImageAnalysisResult {
  description: string;
  itemCount: number;
}

export interface StyleStats {
  og_bonkgang: number;
  hung_hing: number;
  street_gang: number;
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

export async function generateBonkImage(prompt: string, style: string, itemCount: number): Promise<ImageGenerationResult> {
  try {
    // Note: The endpoint name is kept for simplicity as we cannot rename files.
    const response = await fetch('/api/generate-pokemon-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, style, itemCount }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'The server returned an invalid response.' }));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const result: ImageGenerationResult = await response.json();
    if (!result.artworkUrl) {
        throw new Error("The server response did not contain an artwork URL.");
    }
    return result;
  } catch (error) {
    console.error("Error calling generation service:", error);
    if (error instanceof Error) {
        // Re-throw the error with a more user-friendly message for the UI to catch.
        throw new Error(error.message);
    }
    throw new Error("An unknown network error occurred during generation.");
  }
}