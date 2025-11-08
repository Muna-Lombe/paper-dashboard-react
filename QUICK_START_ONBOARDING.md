# 🚀 Quick Start: Pre-Signup Onboarding

## Test It Right Now! 

### Step 1: Start the dev server
```bash
npm run dev
# or
pnpm dev
```

### Step 2: Visit the registration page
Go to: `http://localhost:5173/register`

### Step 3: Try the onboarding
- Answer 6 questions one at a time
- Use Back button to review answers
- Skip onboarding if you want (click "Skip for now")
- Complete and proceed to signup

### Step 4: Verify data storage
Open browser console and run:
```javascript
import { getAllOnboardingData } from './src/utils/onboardingService.js';
console.log(getAllOnboardingData());
```

You'll see your submitted data! ✨

---

## 📁 What Was Added

| File | Purpose |
|------|---------|
| `src/components/OnboardingForm.jsx` | Main form component (typeform-style) |
| `src/utils/onboardingService.js` | Mock backend service |
| `src/views/RegistrationPage.js` | Updated to use OnboardingForm |
| `src/config.js` | Added onboarding endpoint config |
| `ONBOARDING_SETUP.md` | Full documentation |
| `IMPLEMENTATION_SUMMARY.md` | Implementation details |

---

## 🎨 What It Looks Like

```
┌─────────────────────────────────────┐
│  Question 1 of 6            Skip    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━       │
│                                     │
│  What's your name?                  │
│  We'd love to know who we're        │
│  working with                       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Enter your full name        │    │
│  └─────────────────────────────┘    │
│                                     │
│  [← Back]    [Next →]              │
│                                     │
│  This helps us personalize your    │
│  experience. You can update later.  │
└─────────────────────────────────────┘
```

---

## 🔧 Customization

### Want to change questions?
Edit: `src/components/OnboardingForm.jsx`

Find the `questions` array and modify:
```javascript
const questions = [
  {
    id: "fieldName",
    question: "Your question?",
    subtitle: "Helper text",
    type: "text", // or "select" or "checkbox"
    placeholder: "Helper placeholder",
    options: [...], // For select/checkbox
  },
  // ... more questions
];
```

### Want different colors/styling?
Change the Tailwind classes in the same file. Search for `bg-indigo-600` or `text-gray-900` etc.

---

## 🔌 Connect Your Backend

When you have a backend ready:

### 1. Add the endpoint handler
```
POST /api/auth/onboarding
```

### 2. Accept this data structure:
```json
{
  "fullName": "string",
  "institution": "string",
  "teachingLevel": "string",
  "subject": "string",
  "experience": "string",
  "goals": ["string array"]
}
```

### 3. Return this response:
```json
{
  "success": true,
  "message": "Onboarding information saved successfully",
  "data": { /* your stored data */ }
}
```

**That's it!** The form will automatically use your real API instead of the mock service.

---

## 🧪 Test Different Scenarios

### Scenario 1: Complete Full Onboarding
```
1. Answer all 6 questions
2. Click "Complete Onboarding"
3. Fill email & password
4. Create account
```

### Scenario 2: Skip Onboarding
```
1. Click "Skip for now"
2. Go directly to signup form
3. Create account without onboarding
```

### Scenario 3: Update Onboarding Info
```
1. Complete onboarding
2. On signup form, click "Update onboarding information"
3. Redo the form
```

---

## 📊 Form Questions Overview

| # | Question | Type | Options |
|---|----------|------|---------|
| 1 | What's your name? | Text | N/A |
| 2 | What institution do you teach at? | Text | N/A |
| 3 | What level do you teach? | Select | 6 levels |
| 4 | What subject(s) do you teach? | Text | N/A |
| 5 | How many years of experience? | Select | 5 ranges |
| 6 | What are your main goals? | Checkbox | 6 goals |

---

## ⚡ Quick Tips

✅ **All data is validated** - Users can't proceed without answering  
✅ **Works offline** - Uses mock service if API unavailable  
✅ **Data persists** - Stored in localStorage and mock database  
✅ **Mobile friendly** - Responsive design works on all devices  
✅ **Easy to modify** - Just edit the questions array  
✅ **No config needed** - Works out of the box  

---

## 🐛 Troubleshooting

### "Onboarding submission failed"
- Check browser console for details
- Verify VITE_API_URL environment variable (if using backend)
- The form will fallback to local mock service automatically

### Form won't proceed
- Ensure you've filled in all fields on current question
- Text fields can't be empty
- Checkboxes need at least 1 selection

### Data not showing in console
- Make sure you're on the registration page
- Complete and submit the form first
- Check that localStorage is enabled in browser

---

## 📚 Need More Help?

- **Full Setup Guide**: See `ONBOARDING_SETUP.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Component Code**: See `src/components/OnboardingForm.jsx`
- **Service Code**: See `src/utils/onboardingService.js`

---

## 🎉 You're All Set!

The onboarding feature is ready to go. Test it, customize it, and integrate with your backend when ready!

Happy coding! 🚀
