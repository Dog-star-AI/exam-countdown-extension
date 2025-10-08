import browser from "webextension-polyfill";

// Custom exams storage key
const CUSTOM_EXAMS_STORAGE_KEY = "customExams";

/**
 * Get all custom exams from storage
 * @returns {Promise<Array>} Array of custom exam objects
 */
export async function getCustomExams() {
  try {
    const data = await browser.storage.sync.get(CUSTOM_EXAMS_STORAGE_KEY);
    return data[CUSTOM_EXAMS_STORAGE_KEY] || [];
  } catch (error) {
    console.error("Error loading custom exams:", error);
    return [];
  }
}

/**
 * Save custom exams to storage
 * @param {Array} exams - Array of custom exam objects
 * @returns {Promise<boolean>} Success status
 */
export async function saveCustomExams(exams) {
  try {
    await browser.storage.sync.set({ [CUSTOM_EXAMS_STORAGE_KEY]: exams });
    return true;
  } catch (error) {
    console.error("Error saving custom exams:", error);
    return false;
  }
}

/**
 * Add a new custom exam
 * @param {string} name - Exam name
 * @param {Date} date - Exam date
 * @returns {Promise<Object>} The created exam object
 */
export async function addCustomExam(name, date) {
  if (!name || name.trim() === "") {
    throw new Error("Exam name cannot be empty");
  }

  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid exam date");
  }

  const exams = await getCustomExams();
  const newExam = {
    id: Date.now().toString(),
    name: name.trim(),
    date: date.toISOString(),
    createdAt: new Date().toISOString(),
  };

  exams.push(newExam);
  await saveCustomExams(exams);
  return newExam;
}

/**
 * Update an existing custom exam
 * @param {string} id - Exam ID
 * @param {string} name - Updated exam name
 * @param {Date} date - Updated exam date
 * @returns {Promise<boolean>} Success status
 */
export async function updateCustomExam(id, name, date) {
  if (!name || name.trim() === "") {
    throw new Error("Exam name cannot be empty");
  }

  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid exam date");
  }

  const exams = await getCustomExams();
  const examIndex = exams.findIndex((e) => e.id === id);

  if (examIndex !== -1) {
    exams[examIndex] = {
      ...exams[examIndex],
      name: name.trim(),
      date: date.toISOString(),
    };
    await saveCustomExams(exams);
    return true;
  }

  return false;
}

/**
 * Delete a custom exam
 * @param {string} id - Exam ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteCustomExam(id) {
  const exams = await getCustomExams();
  const filteredExams = exams.filter((e) => e.id !== id);

  if (filteredExams.length !== exams.length) {
    await saveCustomExams(filteredExams);
    return true;
  }

  return false;
}

/**
 * Get a specific custom exam by ID
 * @param {string} id - Exam ID
 * @returns {Promise<Object|null>} Exam object or null if not found
 */
export async function getCustomExamById(id) {
  const exams = await getCustomExams();
  const exam = exams.find((e) => e.id === id);
  return exam || null;
}

/**
 * Delete all custom exams
 * @returns {Promise<boolean>} Success status
 */
export async function clearAllCustomExams() {
  await saveCustomExams([]);
  return true;
}
