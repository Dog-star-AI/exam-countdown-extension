# Custom Exams Feature

## Overview
This feature allows users to create, edit, and delete multiple custom exam countdowns that persist across browser sessions using browser local storage.

## Features

### 1. Multiple Custom Exams
- Users can create unlimited custom exam countdowns
- Each exam has a unique ID, name, and date/time
- Exams are stored in browser sync storage for persistence

### 2. Full CRUD Operations
- **Create**: Add new custom exams with name and date/time
- **Read**: View all custom exams in both popup and new tab pages
- **Update**: Edit existing exam names and dates
- **Delete**: Remove individual exams

### 3. UI Components

#### Popup Interface
- **Management Section**: Dedicated area for managing custom exams
  - Add button to create new exams
  - List of all custom exams with countdown timers
  - Edit and delete buttons for each exam
  - Empty state when no exams exist
  
- **Countdown Display**: 
  - Each custom exam shows in its own card
  - Displays countdown in months, days, hours, and minutes
  - Shows "Exam day has passed!" message after exam date

- **Modal Dialog**:
  - Form for adding/editing exams
  - Fields: Exam name and date/time picker
  - Cancel and Save buttons

#### New Tab Interface
- Custom exams appear in the exam selector dropdown
- Each custom exam is labeled with its name and date
- Selecting a custom exam shows its countdown in the main display

### 4. Storage Architecture

#### Storage Key
- `customExams`: Array of custom exam objects

#### Exam Object Structure
```javascript
{
  id: "1234567890",           // Unique timestamp-based ID
  name: "SAT",                // User-defined exam name
  date: "2025-12-15T09:00:00", // ISO 8601 date string
  createdAt: "2024-01-01T10:00:00" // Creation timestamp
}
```

### 5. Backward Compatibility
- Legacy single custom exam support maintained
- Existing `customExamName` and `customExamDate` storage keys still supported
- Users can migrate from old to new system

## Files Modified/Created

### New Files
- `src/utils/customExams.js` - Utility module for custom exam operations
  - `getCustomExams()` - Retrieve all custom exams
  - `addCustomExam(name, date)` - Create new exam
  - `updateCustomExam(id, name, date)` - Update existing exam
  - `deleteCustomExam(id)` - Delete exam by ID
  - `getCustomExamById(id)` - Get specific exam
  - `clearAllCustomExams()` - Remove all exams

### Modified Files
- `src/popup/popup.html`
  - Added custom exams management section
  - Added modal dialog for add/edit
  - Added container for dynamic countdown displays

- `src/popup/popup.js`
  - Imported custom exams utility functions
  - Added `renderCustomExams()` - Display exam list with edit/delete buttons
  - Added `updateCustomExamsCountdowns()` - Update countdown timers
  - Added modal management functions
  - Added event handlers for CRUD operations

- `src/newtab/newtab.js`
  - Imported custom exams utility
  - Updated dropdown population to include all custom exams
  - Updated countdown logic to handle custom exam IDs
  - Maintained backward compatibility with legacy custom exam

## Usage

### Adding a Custom Exam
1. Open browser extension popup
2. Scroll to "Custom Exams" section
3. Click "Add" button
4. Enter exam name (e.g., "SAT", "GATE", "UPSC")
5. Select date and time
6. Click "Save"

### Editing a Custom Exam
1. Find the exam in the Custom Exams section
2. Click the edit icon (pencil) button
3. Modify name and/or date
4. Click "Save"

### Deleting a Custom Exam
1. Find the exam in the Custom Exams section
2. Click the delete icon (trash) button
3. Confirm deletion

### Viewing Custom Exam Countdown
1. **In Popup**: Automatic - all custom exams display with live countdowns
2. **In New Tab**: Select the custom exam from dropdown to view its countdown

## Technical Details

### Storage Sync
- Uses `browser.storage.sync` API
- Automatically syncs across devices (Chrome sync, Firefox sync)
- Quota: ~100KB (sufficient for hundreds of exams)

### Date Handling
- Dates stored as ISO 8601 strings
- Timezone-aware using local timezone
- datetime-local input for user-friendly date selection

### Performance
- Efficient rendering with DOM diffing
- Only updates changed elements
- Minimal storage operations

### Error Handling
- Validation for required fields
- Protection against invalid dates
- Graceful degradation if storage unavailable

## Testing

The feature includes comprehensive error handling and has been tested for:
- ✅ Adding multiple custom exams
- ✅ Editing exam details
- ✅ Deleting exams
- ✅ Persistence across sessions
- ✅ Display in popup with live countdowns
- ✅ Integration with new tab page
- ✅ Backward compatibility with legacy custom exam

## Future Enhancements

Potential improvements:
- Export/import custom exams
- Recurring exams (e.g., weekly tests)
- Exam categories/tags
- Notifications/reminders
- Color customization per exam
- Sorting options (by date, name, etc.)
