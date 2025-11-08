/**
 * Onboarding Service
 * Handles onboarding data storage and provides a mock endpoint
 * for pre-signup onboarding form submissions
 */

// Mock database for storing onboarding submissions
const onboardingDB = new Map();

/**
 * Mock endpoint for onboarding form submission
 * In production, this would be replaced with a real API call
 * For now, it simulates a successful backend response
 */
export const submitOnboardingData = async (onboardingData) => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      try {
        // Generate a unique ID for this onboarding submission
        const onboardingId = `onb_${Date.now()}`;

        // Store the onboarding data with timestamp
        onboardingDB.set(onboardingId, {
          ...onboardingData,
          submittedAt: new Date().toISOString(),
          id: onboardingId,
        });

        // Log submission (for debugging)
        console.log("Onboarding submission stored:", {
          id: onboardingId,
          data: onboardingData,
        });

        // Simulate successful server response
        resolve({
          success: true,
          message: "Onboarding information saved successfully",
          data: {
            id: onboardingId,
            ...onboardingData,
          },
          status: 200,
        });
      } catch (error) {
        resolve({
          success: false,
          message: "Failed to save onboarding information",
          error: error.message,
          status: 500,
        });
      }
    }, 500); // Simulate 500ms network latency
  });
};

/**
 * Retrieve stored onboarding data by ID
 */
export const getOnboardingData = (onboardingId) => {
  return onboardingDB.get(onboardingId) || null;
};

/**
 * Get all stored onboarding submissions (for admin purposes)
 */
export const getAllOnboardingData = () => {
  return Array.from(onboardingDB.values());
};

/**
 * Clear onboarding storage (useful for testing)
 */
export const clearOnboardingData = () => {
  onboardingDB.clear();
};

export default {
  submitOnboardingData,
  getOnboardingData,
  getAllOnboardingData,
  clearOnboardingData,
};
