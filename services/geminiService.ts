

export interface ImageAnalysisResult {
  description: string;
}

export async function analyzeImage(imageFile: File, style: string): Promise<ImageAnalysisResult> {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('style', style);

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
    if (!result.description) {
      throw new Error("The server response was incomplete or did not contain a description.");
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