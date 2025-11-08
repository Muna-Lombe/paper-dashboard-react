# Pre-Signup Onboarding Feature

## Overview

The pre-signup onboarding feature provides a beautiful, typeform-style form that collects general information about teachers before they create their account. This helps personalize their experience and gather valuable onboarding data.

## Components

### 1. **OnboardingForm.jsx** (`src/components/OnboardingForm.jsx`)

The main onboarding form component with the following features:

- **Typeform-style UI**: Beautiful, modern design with one question per screen
- **Progress tracking**: Visual progress bar showing completion percentage
- **Multiple question types**:
  - Text input (open-ended questions)
  - Radio buttons (single-choice questions)
  - Checkboxes (multi-select questions)
- **Navigation**: Back/Next buttons with validation
- **Skip option**: Users can skip onboarding and proceed to signup later
- **Graceful API fallback**: Works with or without a backend API

### 2. **RegistrationPage.js** (`src/views/RegistrationPage.js`)

Updated registration page that:

- Shows OnboardingForm first
- Displays signup form after onboarding completion (or skip)
- Shows a welcome message with user's name if they completed onboarding
- Stores onboarding data in localStorage for future reference
- Allows users to update onboarding information

### 3. **onboardingService.js** (`src/utils/onboardingService.js`)

Mock backend service providing:

- `submitOnboardingData()`: Simulates API submission and stores data locally
- `getOnboardingData()`: Retrieves stored onboarding data by ID
- `getAllOnboardingData()`: Gets all stored submissions (useful for admin dashboard)
- `clearOnboardingData()`: Clears all stored data (useful for testing)

## Onboarding Questions

The form asks 6 key questions:

1. **Full Name** - Text input
   - Question: "What's your name?"
   - Subtitle: "We'd love to know who we're working with"

2. **Institution** - Text input
   - Question: "What institution do you teach at?"
   - Subtitle: "School name, university, or organization"

3. **Teaching Level** - Radio select
   - Options: Elementary School, Middle School, High School, University, Corporate Training, Other

4. **Subject(s)** - Text input
   - Question: "What subject(s) do you teach?"
   - Placeholder: "e.g., Mathematics, Physics, Literature"

5. **Teaching Experience** - Radio select
   - Options: Less than 1 year, 1-3 years, 3-5 years, 5-10 years, 10+ years

6. **Goals** - Checkbox select (multi-select)
   - Options: Create better course content, Save time on lesson planning, Improve student engagement, Track student progress, Collaborate with colleagues, Other

## Data Flow

### Local Flow (Development)

```
User visits /register
    ↓
OnboardingForm shows (step 1-6)
    ↓
User completes onboarding
    ↓
submitOnboardingData() called
    ↓
Local mock service stores data (in-memory Map)
    ↓
Onboarding data stored in localStorage
    ↓
RegistrationPage shows signup form with welcome message
    ↓
User enters email/password and submits
    ↓
Account created via /api/auth/register
```

### With Backend API

Once your backend is ready, simply implement the `/api/auth/onboarding` endpoint and the form will automatically use it (with fallback to local storage).

## Setup Instructions

### Current Setup (Uses Local Mock Service)

The feature is already set up and working! No additional configuration needed. The form will:

1. Try to submit to the backend API endpoint (`/api/auth/onboarding`)
2. If the API is unavailable, it automatically falls back to the local mock service

### Backend Integration (When Ready)

When your backend is ready, implement the following endpoint:

**Endpoint**: `POST /api/auth/onboarding`

**Request Body**:
```json
{
  "fullName": "John Doe",
  "institution": "Lincoln High School",
  "teachingLevel": "High School",
  "subject": "Mathematics",
  "experience": "5-10 years",
  "goals": ["Create better course content", "Improve student engagement"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Onboarding information saved successfully",
  "data": {
    "id": "onb_1234567890",
    "fullName": "John Doe",
    "institution": "Lincoln High School",
    "teachingLevel": "High School",
    "subject": "Mathematics",
    "experience": "5-10 years",
    "goals": ["Create better course content", "Improve student engagement"]
  }
}
```

### Example Backend Implementation (Express.js)

```javascript
// backend/routes/auth.js
router.post('/onboarding', async (req, res) => {
  try {
    const { fullName, institution, teachingLevel, subject, experience, goals } = req.body;

    // Validate required fields
    if (!fullName || !institution || !teachingLevel || !subject || !experience || !goals) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Store in database
    const onboarding = new Onboarding({
      fullName,
      institution,
      teachingLevel,
      subject,
      experience,
      goals,
      submittedAt: new Date()
    });

    await onboarding.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding information saved successfully',
      data: onboarding
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save onboarding information',
      error: error.message
    });
  }
});
```

## Configuration

The onboarding endpoint is configured in `src/config.js`:

```javascript
onboarding: {
    url: `${baseApiUrl}/api/auth/onboarding`,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
},
```

Update `baseApiUrl` to point to your backend API server.

## Features

✅ **Beautiful UI**: Typeform-style one-question-per-screen design  
✅ **Progress Tracking**: Visual progress bar  
✅ **Flexible Questions**: Mix of text, radio, and checkbox inputs  
✅ **Skip Option**: Users can skip onboarding  
✅ **Offline Support**: Works without backend using local mock service  
✅ **Fallback Logic**: Automatically uses mock service if API unavailable  
✅ **Data Persistence**: Stores data in localStorage and mock database  
✅ **Form Validation**: Each step is validated before proceeding  
✅ **Navigation**: Back/Next buttons with disabled states  
✅ **Welcome Message**: Shows user's name after onboarding  

## Customization

### Add New Questions

Edit `src/components/OnboardingForm.jsx` and add new items to the `questions` array:

```javascript
{
  id: "yourFieldId",
  question: "Your question?",
  subtitle: "Helpful subtitle",
  type: "text", // or "select" or "checkbox"
  placeholder: "Helpful placeholder",
  options: [...], // For select/checkbox types
}
```

Also update the initial state:

```javascript
const [responses, setResponses] = useState({
  // ... existing fields
  yourFieldId: "",
});
```

### Modify Question Types

Each question can use:
- `"text"`: Single-line text input
- `"select"`: Radio buttons (single choice)
- `"checkbox"`: Checkboxes (multiple choice)

### Styling

The component uses Tailwind CSS. Modify the className strings to customize colors, sizes, and layout.

## Testing

### Local Testing (Mock Service)

1. Navigate to `/register`
2. Complete the onboarding form
3. Proceed to signup
4. Check browser console to see stored data

### Debug Mock Service

From the browser console, you can access:

```javascript
// Get all onboarding submissions
import { getAllOnboardingData } from './utils/onboardingService.js';
console.log(getAllOnboardingData());

// Clear all data
import { clearOnboardingData } from './utils/onboardingService.js';
clearOnboardingData();
```

## Troubleshooting

### "Onboarding submission failed" error

1. Check if backend API is running and accessible
2. Verify the `VITE_API_URL` environment variable is set correctly
3. Check browser console for more details
4. The form will automatically fall back to local mock service

### Data not persisting after page refresh

The local mock service stores data in memory. To persist data across sessions, implement the backend endpoint or modify `onboardingService.js` to use IndexedDB or localStorage.

### Form validation issues

Ensure each question has a valid response:
- Text fields: Must not be empty
- Select fields: Must have a selection
- Checkbox fields: Must have at least one selection

## Future Enhancements

- [ ] Persist mock data to localStorage
- [ ] Add analytics tracking for onboarding completion rates
- [ ] Implement conditional questions based on previous answers
- [ ] Add rich media support (images, videos)
- [ ] Create admin dashboard to view onboarding submissions
- [ ] Send confirmation email after signup
- [ ] Personalize dashboard based on onboarding responses

## Files Modified

- `src/components/OnboardingForm.jsx` - New component
- `src/views/RegistrationPage.js` - Updated to use OnboardingForm
- `src/utils/onboardingService.js` - New mock service
- `src/config.js` - Added onboarding endpoint config
