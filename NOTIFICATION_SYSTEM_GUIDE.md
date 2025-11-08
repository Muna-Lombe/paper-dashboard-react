# Notification System - Complete Guide

## ✅ What Was Built

A complete, production-ready notification system that displays toasts and errors globally across your app.

### Components Created

1. **Toast.jsx** - Individual notification card component
   - Auto-dismiss after 3 seconds
   - Smooth slide-in/out animations
   - Color-coded by type
   - Manual close button

2. **ToastContainer.jsx** - Main toast display container
   - Reads from Redux `state.toasts`
   - Renders all toast notifications
   - Fixed position (top-right)
   - Accessible (ARIA labels)

3. **ErrorContainer.jsx** - Error notifications display
   - Reads from Redux `state.errors`
   - Renders error messages
   - Auto-dismiss after 5 seconds
   - Same animation/styling as toasts

### Redux Slices Updated

1. **toastSlice.js** - Enhanced with:
   - Unique ID generation
   - Type support (success, error, info, warning)
   - Auto-close timing
   - Timestamps
   - `clearToasts` action

2. **errorSlice.js** - Enhanced with:
   - Unique ID generation
   - Proper structure for display
   - Auto-close timing
   - Timestamps

### Integration

- **Wired into index.js** - Global, shows on all pages
- **Positioned top-right** - Doesn't interfere with content
- **High z-index** - Always visible
- **Accessible** - ARIA roles and live regions

---

## 📚 How to Use

### Displaying Toast Notifications

#### Simple Usage (Backward Compatible)
```javascript
import { useDispatch } from "react-redux";
import { addToast } from "../variables/slices/toastSlice";

function MyComponent() {
  const dispatch = useDispatch();

  const handleSuccess = () => {
    // Simple string message (defaults to 'info' type)
    dispatch(addToast("Operation successful!"));
  };

  return <button onClick={handleSuccess}>Do Something</button>;
}
```

#### Advanced Usage (Recommended)
```javascript
import { useDispatch } from "react-redux";
import { addToast } from "../variables/slices/toastSlice";

function MyComponent() {
  const dispatch = useDispatch();

  const handleSuccess = () => {
    dispatch(addToast({
      message: "Profile updated successfully!",
      type: "success",      // 'success' | 'error' | 'info' | 'warning'
      autoClose: 3000       // Optional: auto-dismiss after 3 seconds
    }));
  };

  const handleError = () => {
    dispatch(addToast({
      message: "Failed to save changes. Please try again.",
      type: "error",
      autoClose: 5000
    }));
  };

  const handleWarning = () => {
    dispatch(addToast({
      message: "This action cannot be undone!",
      type: "warning",
      autoClose: 4000
    }));
  };

  const handleInfo = () => {
    dispatch(addToast({
      message: "Here's some helpful information.",
      type: "info",
      autoClose: 3000
    }));
  };

  return (
    <>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </>
  );
}
```

### Displaying Error Notifications

```javascript
import { useDispatch } from "react-redux";
import { addError } from "../variables/slices/errorSlice";

function MyComponent() {
  const dispatch = useDispatch();

  const handleError = async () => {
    try {
      // Do something
    } catch (error) {
      dispatch(addError({
        message: error.message || "Something went wrong",
        autoClose: 5000  // Optional
      }));
    }
  };

  return <button onClick={handleError}>Try Action</button>;
}
```

---

## 🎨 Notification Types

### Success (Green)
```javascript
dispatch(addToast({
  message: "Your changes have been saved!",
  type: "success"
}));
```
✅ Green background, checkmark icon

### Error (Red)
```javascript
dispatch(addToast({
  message: "An error occurred. Please try again.",
  type: "error"
}));
```
❌ Red background, X icon

### Warning (Yellow)
```javascript
dispatch(addToast({
  message: "This action cannot be undone!",
  type: "warning"
}));
```
⚠️ Yellow background, exclamation icon

### Info (Blue)
```javascript
dispatch(addToast({
  message: "Here's some helpful information.",
  type: "info"
}));
```
ℹ️ Blue background, info icon

---

## 🔧 Configuration Options

### Toast Configuration
```javascript
{
  message: "Your message here",           // Required
  type: "success" | "error" | "info" | "warning",  // Default: 'info'
  autoClose: 3000,                        // Milliseconds, default: 3000
  id: "unique-id"                         // Optional: auto-generated if not provided
}
```

### Error Configuration
```javascript
{
  message: "Error message here",          // Required
  autoClose: 5000,                        // Milliseconds, default: 5000
  id: "unique-id"                         // Optional: auto-generated if not provided
}
```

---

## 🔄 Real-World Examples

### Example 1: Form Submission
```javascript
import { useDispatch } from "react-redux";
import { addToast, addError } from "../variables/slices/toastSlice";
import { addError } from "../variables/slices/errorSlice";

function ContactForm() {
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({...data})
      });

      if (response.ok) {
        dispatch(addToast({
          message: "Message sent successfully!",
          type: "success"
        }));
        // Clear form...
      } else {
        dispatch(addError("Failed to send message"));
      }
    } catch (error) {
      dispatch(addError(error.message));
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Example 2: File Upload
```javascript
function FileUpload() {
  const dispatch = useDispatch();

  const handleUpload = async (file) => {
    try {
      // Validate file
      if (file.size > 10000000) {
        dispatch(addToast({
          message: "File is too large. Maximum: 10MB",
          type: "warning"
        }));
        return;
      }

      // Upload
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        dispatch(addToast({
          message: "File uploaded successfully!",
          type: "success"
        }));
      } else {
        dispatch(addError("Upload failed"));
      }
    } catch (error) {
      dispatch(addError(error.message));
    }
  };

  return <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />;
}
```

### Example 3: API Call with Loading
```javascript
function UserProfile() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const updateProfile = async (newData) => {
    setLoading(true);
    
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify(newData)
      });

      if (response.ok) {
        dispatch(addToast({
          message: "Profile updated successfully!",
          type: "success"
        }));
      } else {
        dispatch(addError("Failed to update profile"));
      }
    } catch (error) {
      dispatch(addError(error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={() => updateProfile({...})} disabled={loading}>
      {loading ? "Saving..." : "Save Changes"}
    </button>
  );
}
```

---

## 🔴 Using with OnboardingForm

Your onboarding form can now properly show success/error messages:

```javascript
// In OnboardingForm.jsx
import { addToast } from "../variables/slices/toastSlice";
import { addError } from "../variables/slices/errorSlice";

const handleSubmit = async () => {
  setLoading(true);
  try {
    // ... submission logic
    
    if (response.success) {
      dispatch(addToast({
        message: "Onboarding completed successfully!",
        type: "success",
        autoClose: 3000
      }));
      onComplete(responses);
    } else {
      dispatch(addError(response.message));
    }
  } catch (error) {
    dispatch(addError(error.message));
  } finally {
    setLoading(false);
  }
};
```

Users will now **SEE** success/error messages! 🎉

---

## 📍 Positioning & Z-Index

- **ToastContainer**: `top-right`, z-index: 50
- **ErrorContainer**: `top-right` (below toasts), z-index: 40
- **Both**: Fixed position, always visible

If you need to change position:
1. Edit `ToastContainer.jsx` - change `fixed top-4 right-4` classes
2. Edit `ErrorContainer.jsx` - same location

---

## 🎨 Customizing Appearance

### Change Position
```javascript
// In ToastContainer.jsx, change:
className="fixed top-4 right-4 z-50..."
// To:
className="fixed bottom-4 left-4 z-50..."  // Bottom-left
// Or:
className="fixed top-1/2 left-1/2 z-50..."  // Center
```

### Change Colors
Edit `Toast.jsx` and modify the `typeConfig` object:
```javascript
const typeConfig = {
  success: {
    bg: "bg-green-50",           // Change this
    border: "border-l-4 border-green-500",  // Or this
    // ...
  },
  // ...
};
```

### Disable Auto-Dismiss
```javascript
dispatch(addToast({
  message: "This won't auto-dismiss",
  type: "info",
  autoClose: false  // Disable auto-dismiss
}));
```

---

## 🐛 Troubleshooting

### Notifications Not Showing
1. Check Redux DevTools - are toasts in state?
2. Verify ToastContainer is in index.js
3. Check browser console for errors

### Wrong Position
1. Check z-index - might be hidden behind other elements
2. Verify fixed positioning classes in components

### Not Auto-Dismissing
1. Check autoClose value (must be > 0)
2. Verify useEffect in Toast.jsx is working

---

## ✅ Backward Compatibility

The old way still works:
```javascript
// Old way (still works)
dispatch(addToast("Simple message"))

// New way (recommended)
dispatch(addToast({
  message: "Better message",
  type: "success"
}))
```

Both work! The system handles both formats.

---

## 📊 Files Modified

- ✅ `src/components/Toast.jsx` - Created
- ✅ `src/components/ToastContainer.jsx` - Created
- ✅ `src/components/ErrorContainer.jsx` - Created
- ✅ `src/variables/slices/toastSlice.js` - Updated
- ✅ `src/variables/slices/errorSlice.js` - Updated
- ✅ `src/index.js` - Updated

---

## 🚀 Ready to Use!

Your notification system is now complete and ready to use across your entire app!

Start using it in your components today. Your users will now see proper feedback on all actions. 🎉
