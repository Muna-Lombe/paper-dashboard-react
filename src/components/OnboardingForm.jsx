import React, { useState } from "react";
import { endpoints } from "../config";
import { useDispatch } from "react-redux";
import { addError } from "../variables/slices/errorSlice";
import { submitOnboardingData } from "../utils/onboardingService";

function OnboardingForm({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    fullName: "",
    institution: "",
    teachingLevel: "",
    subject: "",
    experience: "",
    goals: [],
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const questions = [
    {
      id: "fullName",
      question: "What's your name?",
      subtitle: "We'd love to know who we're working with",
      type: "text",
      placeholder: "Enter your full name",
    },
    {
      id: "institution",
      question: "What institution do you teach at?",
      subtitle: "School name, university, or organization",
      type: "text",
      placeholder: "e.g., Lincoln High School",
    },
    {
      id: "teachingLevel",
      question: "What level do you teach?",
      subtitle: "Choose the primary level",
      type: "select",
      options: [
        "Elementary School",
        "Middle School",
        "High School",
        "University",
        "Corporate Training",
        "Other",
      ],
    },
    {
      id: "subject",
      question: "What subject(s) do you teach?",
      subtitle: "Your main subject area",
      type: "text",
      placeholder: "e.g., Mathematics, Physics, Literature",
    },
    {
      id: "experience",
      question: "How many years of teaching experience do you have?",
      subtitle: "Help us understand your background",
      type: "select",
      options: [
        "Less than 1 year",
        "1-3 years",
        "3-5 years",
        "5-10 years",
        "10+ years",
      ],
    },
    {
      id: "goals",
      question: "What are your main goals with this platform?",
      subtitle: "Select all that apply",
      type: "checkbox",
      options: [
        "Create better course content",
        "Save time on lesson planning",
        "Improve student engagement",
        "Track student progress",
        "Collaborate with colleagues",
        "Other",
      ],
    },
  ];

  const handleInputChange = (value) => {
    setResponses({
      ...responses,
      [questions[currentStep].id]: value,
    });
  };

  const handleCheckboxChange = (option) => {
    const goals = responses.goals || [];
    if (goals.includes(option)) {
      setResponses({
        ...responses,
        goals: goals.filter((g) => g !== option),
      });
    } else {
      setResponses({
        ...responses,
        goals: [...goals, option],
      });
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let response;
      
      // Try to use the API endpoint first, fallback to local mock service
      try {
        response = await endpoints.auth.onboarding.post(responses);

        // Convert API response to match our expected format
        if (response.status === 200 || response.data.success) {
          onComplete(responses);
          return;
        }
      } catch (apiError) {
        // If API fails, use local mock service
        console.warn("API endpoint unavailable, using local mock service", apiError.message);
        const mockResponse = await submitOnboardingData(responses);
        response = mockResponse;
      }

      if (response.success || response.status === 200) {
        onComplete(responses);
      } else {
        dispatch(addError(response.message || "Failed to submit onboarding information"));
      }
    } catch (error) {
      console.error("Onboarding submission error:", error);
      dispatch(
        addError(error.response?.data?.message || "Onboarding submission failed")
      );
    } finally {
      setLoading(false);
    }
  };

  const isCurrentStepValid = () => {
    const currentQuestion = questions[currentStep];
    const currentResponse = responses[currentQuestion.id];

    if (currentQuestion.type === "checkbox") {
      return Array.isArray(currentResponse) && currentResponse.length > 0;
    }

    return currentResponse && currentResponse.trim() !== "";
  };

  const isLastStep = currentStep === questions.length - 1;
  const currentQuestion = questions[currentStep];
  const currentResponse = responses[currentQuestion.id];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentStep + 1} of {questions.length}
            </span>
            <button
              onClick={onSkip}
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              Skip for now
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Question Title */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              {currentQuestion.question}
            </h2>
            <p className="text-lg text-gray-500">{currentQuestion.subtitle}</p>
          </div>

          {/* Input Area */}
          <div className="mb-10">
            {currentQuestion.type === "text" && (
              <input
                type="text"
                placeholder={currentQuestion.placeholder}
                value={currentResponse || ""}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-indigo-600 focus:outline-none transition bg-transparent"
                autoFocus
              />
            )}

            {currentQuestion.type === "select" && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition ${
                      currentResponse === option
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option}
                      checked={currentResponse === option}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="w-5 h-5 text-indigo-600"
                    />
                    <span className="ml-3 text-gray-700 font-medium">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === "checkbox" && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition ${
                      (currentResponse || []).includes(option)
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(currentResponse || []).includes(option)}
                      onChange={() => handleCheckboxChange(option)}
                      className="w-5 h-5 text-indigo-600 rounded"
                    />
                    <span className="ml-3 text-gray-700 font-medium">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>

            {!isLastStep ? (
              <button
                onClick={handleNext}
                disabled={!isCurrentStepValid()}
                className="flex-1 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isCurrentStepValid() || loading}
                className="flex-1 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Complete Onboarding"}
              </button>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500">
          <p>This helps us personalize your experience. You can update these later.</p>
        </div>
      </div>
    </div>
  );
}

export default OnboardingForm;
