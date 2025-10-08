import {
  getTimeRemaining,
  getCustomExamData,
  hasValidCustomExam,
  loadCustomExamData,
} from "../newtab/newtab.js";
import { initializePopupTodoUI } from "./popup-todo-ui.js";
import {
  getCustomExams,
  addCustomExam,
  updateCustomExam,
  deleteCustomExam,
} from "../utils/customExams.js";
import browser from "webextension-polyfill";

async function updateCountdown() {
  const storedData = await browser.storage.sync.get("countdowns");
  const countdowns = storedData.countdowns || {};

  const jeeExamDate = countdowns.jee?.date
    ? new Date(countdowns.jee.date)
    : new Date(2026, 0, 29);
  const neetExamDate = countdowns.neet?.date
    ? new Date(countdowns.neet.date)
    : new Date(2026, 4, 4);
  const jeeAdvExamDate = countdowns.jeeAdv?.date
    ? new Date(countdowns.jeeAdv.date)
    : new Date(2027, 4, 18);

  await loadCustomExamData();

  // JEE Main countdown
  const jeeTime = getTimeRemaining(jeeExamDate);
  if (jeeTime.total <= 0) {
    document.getElementById("jee-timer").innerHTML =
      "<p class='font-medium text-success'>Exam day has arrived!</p>";
  } else {
    document.getElementById("jee-months").style = `--value:${jeeTime.month}`;
    document.getElementById("jee-days").style = `--value:${jeeTime.days}`;
    document.getElementById("jee-hours").style = `--value:${jeeTime.hours}`;
    document.getElementById("jee-minutes").style = `--value:${jeeTime.minutes}`;
    document.getElementById("jee-seconds").style = `--value:${jeeTime.seconds}`;
  }

  // JEE Advanced countdown
  const jeeAdvTime = getTimeRemaining(jeeAdvExamDate);
  if (jeeAdvTime.total <= 0) {
    document.getElementById("jee-adv-timer").innerHTML =
      "<p class='font-medium text-success'>Exam day has arrived!</p>";
  } else {
    document.getElementById(
      "jee-adv-months"
    ).style = `--value:${jeeAdvTime.month}`;
    document.getElementById(
      "jee-adv-days"
    ).style = `--value:${jeeAdvTime.days}`;
    document.getElementById(
      "jee-adv-hours"
    ).style = `--value:${jeeAdvTime.hours}`;
    document.getElementById(
      "jee-adv-minutes"
    ).style = `--value:${jeeAdvTime.minutes}`;
    document.getElementById(
      "jee-adv-seconds"
    ).style = `--value:${jeeAdvTime.seconds}`;
  }

  // NEET countdown
  const neetTime = getTimeRemaining(neetExamDate);
  if (neetTime.total <= 0) {
    document.getElementById("neet-timer").innerHTML =
      "<p class='font-medium text-success'>Exam day has arrived!</p>";
  } else {
    document.getElementById("neet-months").style = `--value:${neetTime.month}`;
    document.getElementById("neet-days").style = `--value:${neetTime.days}`;
    document.getElementById("neet-hours").style = `--value:${neetTime.hours}`;
    document.getElementById(
      "neet-minutes"
    ).style = `--value:${neetTime.minutes}`;
    document.getElementById(
      "neet-seconds"
    ).style = `--value:${neetTime.seconds}`;
  }

  // Custom exam countdown (legacy - for backward compatibility)
  if (hasValidCustomExam()) {
    const customExamSection = document.getElementById("custom-exam-section");

    if (customExamSection) {
      customExamSection.classList.remove("hidden");
    }

    const customExam = getCustomExamData();

    const customExamBadge = document.getElementById("custom-exam-badge");
    if (customExamBadge) {
      customExamBadge.textContent = customExam.name;
    }

    const customExamTime = getTimeRemaining(customExam.date);
    if (customExamTime.total <= 0) {
      document.getElementById("custom-exam-timer").innerHTML =
        "<p class='font-medium text-success'>Exam day has arrived!</p>";
    } else {
      document.getElementById(
        "custom-exam-months"
      ).style = `--value:${customExamTime.month}`;
      document.getElementById(
        "custom-exam-days"
      ).style = `--value:${customExamTime.days}`;
      document.getElementById(
        "custom-exam-hours"
      ).style = `--value:${customExamTime.hours}`;
      document.getElementById(
        "custom-exam-minutes"
      ).style = `--value:${customExamTime.minutes}`;
      document.getElementById(
        "custom-exam-seconds"
      ).style = `--value:${customExamTime.seconds}`;
    }
  } else {
    const customExamSection = document.getElementById("custom-exam-section");

    if (customExamSection) {
      customExamSection.classList.add("hidden");
    }
  }

  // Update custom exams countdowns
  await updateCustomExamsCountdowns();
}

async function updateCustomExamsCountdowns() {
  const container = document.getElementById("custom-exams-countdown-container");
  if (!container) return;

  const exams = await getCustomExams();
  
  // Sort exams by date (closest first)
  exams.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Get existing countdown elements
  const existingCountdowns = Array.from(container.children);

  // Create a map of existing countdowns by exam ID
  const existingMap = new Map();
  existingCountdowns.forEach((el) => {
    const examId = el.dataset.examId;
    if (examId) {
      existingMap.set(examId, el);
    }
  });

  // Update or create countdown elements
  exams.forEach((exam, index) => {
    let countdownElement = existingMap.get(exam.id);

    if (!countdownElement) {
      // Create new countdown element
      countdownElement = document.createElement("div");
      countdownElement.className =
        "card bg-base-100 shadow-md border border-base-300 mb-5 w-full custom-exam-countdown";
      countdownElement.dataset.examId = exam.id;
      container.appendChild(countdownElement);
    }

    // Remove from map as we've processed it
    existingMap.delete(exam.id);

    const examDate = new Date(exam.date);
    const timeRemaining = getTimeRemaining(examDate);

    // Load seconds visibility setting
    browser.storage.sync.get(["widgetVisibility"]).then((data) => {
      const showSeconds = data.widgetVisibility?.seconds !== false;
      const secondsDisplay = showSeconds ? "" : "none";

      if (timeRemaining.total <= 0) {
        countdownElement.innerHTML = `
          <div class="card-body p-4">
            <div class="flex justify-center items-center mb-3">
              <div class="badge badge-primary badge-lg font-semibold">${exam.name}</div>
            </div>
            <div class="text-center">
              <p class='font-medium text-success'>Exam day has arrived!</p>
            </div>
          </div>
        `;
      } else {
        countdownElement.innerHTML = `
          <div class="card-body p-4">
            <div class="flex justify-center items-center mb-3">
              <div class="badge badge-primary badge-lg font-semibold">${exam.name}</div>
            </div>
            <div class="text-center">
              <div class="grid grid-flow-col gap-2 text-center auto-cols-max justify-center">
                <div class="flex flex-col">
                  <span class="countdown text-2xl">
                    <span style="--value:${timeRemaining.month}"></span>
                  </span>
                  Months
                </div>
                <div class="flex flex-col">
                  <span class="countdown text-2xl">
                    <span style="--value:${timeRemaining.days}"></span>
                  </span>
                  Days
                </div>
                <div class="flex flex-col">
                  <span class="countdown text-2xl">
                    <span style="--value:${timeRemaining.hours}"></span>
                  </span>
                  Hours
                </div>
                <div class="flex flex-col">
                  <span class="countdown text-2xl">
                    <span style="--value:${timeRemaining.minutes}"></span>
                  </span>
                  Min
                </div>
                <div class="flex flex-col" style="display: ${secondsDisplay}">
                  <span class="countdown text-2xl">
                    <span style="--value:${timeRemaining.seconds}"></span>
                  </span>
                  Sec
                </div>
              </div>
            </div>
          </div>
        `;
      }
    });
  });

  // Remove any countdown elements for exams that no longer exist
  existingMap.forEach((element) => {
    element.remove();
  });
}

function loadThemePreference() {
  browser.storage.sync.get(["theme"]).then((data) => {
    if (data.theme) {
      document.documentElement.dataset.theme = data.theme;
    }
  });
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme;
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.dataset.theme = newTheme;

  if (browser.storage) {
    browser.storage.sync.set({ theme: newTheme }).catch(function (error) {
      console.error("Error saving theme preference:", error);
    });
  }
}

function openFullCountdown() {
  browser.tabs.create({ url: browser.runtime.getURL("newtab/newtab.html") });
}

function loadSecondsVisibility() {
  browser.storage.sync.get(["widgetVisibility"]).then((data) => {
    const showSeconds = data.widgetVisibility?.seconds !== false;
    
    // Hide or show all seconds containers
    const secondsContainers = [
      "custom-exam-seconds-container",
      "jee-seconds-container",
      "jee-adv-seconds-container",
      "neet-seconds-container"
    ];
    
    secondsContainers.forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        container.style.display = showSeconds ? "" : "none";
      }
    });
  });
}

function initializeTabs() {
  const examTab = document.getElementById("exam-tab");
  const todoTab = document.getElementById("todo-tab");
  const examContent = document.getElementById("exam-content");
  const todoContent = document.getElementById("todo-content");

  if (examTab && todoTab && examContent && todoContent) {
    examTab.addEventListener("click", () => {
      // Switch to exam tab
      examTab.classList.add("tab-active");
      todoTab.classList.remove("tab-active");
      examContent.classList.remove("hidden");
      todoContent.classList.add("hidden");
    });

    todoTab.addEventListener("click", () => {
      // Switch to todo tab
      todoTab.classList.add("tab-active");
      examTab.classList.remove("tab-active");
      todoContent.classList.remove("hidden");
      examContent.classList.add("hidden");
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateCountdown();
  loadThemePreference();
  loadSecondsVisibility(); // Load seconds visibility setting
  initializeTabs(); // Initialize tab functionality
  initializePopupTodoUI(); // Initialize popup todo UI
  setInterval(updateCountdown, 1000);

  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  // Listen for changes in widgetVisibility settings
  if (browser.storage && browser.storage.onChanged) {
    browser.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === "sync" && changes.widgetVisibility) {
        loadSecondsVisibility();
      }
      if (namespace === "sync" && changes.customExams) {
        renderCustomExams();
      }
    });
  }

  // Initialize custom exams management
  initializeCustomExamsUI();
});

// Custom Exams Management Functions
let editingExamId = null;

async function renderCustomExams() {
  const customExamsList = document.getElementById("custom-exams-list");
  const emptyState = document.getElementById("custom-exams-empty-state");
  
  if (!customExamsList) return;

  const exams = await getCustomExams();

  if (exams.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    // Clear any existing exam cards
    const examCards = customExamsList.querySelectorAll(".custom-exam-card");
    examCards.forEach(card => card.remove());
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  // Clear existing exam cards
  const existingCards = customExamsList.querySelectorAll(".custom-exam-card");
  existingCards.forEach(card => card.remove());

  // Sort exams by date (closest first)
  exams.sort((a, b) => new Date(a.date) - new Date(b.date));

  exams.forEach((exam) => {
    const examDate = new Date(exam.date);
    const timeRemaining = getTimeRemaining(examDate, false);
    
    const examCard = document.createElement("div");
    examCard.className = "custom-exam-card card bg-base-200 border border-base-300 p-3";
    
    const isPast = timeRemaining.total <= 0;
    
    examCard.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <div class="flex-1">
          <h3 class="font-semibold text-sm">${exam.name}</h3>
          <p class="text-xs opacity-70 mt-1">${examDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}</p>
        </div>
        <div class="flex gap-1">
          <button class="btn btn-ghost btn-xs btn-square edit-exam-btn" data-exam-id="${exam.id}" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>
          <button class="btn btn-ghost btn-xs btn-square delete-exam-btn" data-exam-id="${exam.id}" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
      <div class="text-center ${isPast ? 'text-success' : ''}">
        ${isPast 
          ? '<p class="text-xs font-medium">Exam day has passed!</p>'
          : `<div class="grid grid-flow-col gap-1 text-center auto-cols-max justify-center">
              <div class="flex flex-col">
                <span class="countdown text-sm font-mono">
                  <span style="--value:${timeRemaining.month}"></span>
                </span>
                <span class="text-xs opacity-70">mo</span>
              </div>
              <div class="flex flex-col">
                <span class="countdown text-sm font-mono">
                  <span style="--value:${timeRemaining.days}"></span>
                </span>
                <span class="text-xs opacity-70">d</span>
              </div>
              <div class="flex flex-col">
                <span class="countdown text-sm font-mono">
                  <span style="--value:${timeRemaining.hours}"></span>
                </span>
                <span class="text-xs opacity-70">h</span>
              </div>
              <div class="flex flex-col">
                <span class="countdown text-sm font-mono">
                  <span style="--value:${timeRemaining.minutes}"></span>
                </span>
                <span class="text-xs opacity-70">m</span>
              </div>
            </div>`
        }
      </div>
    `;
    
    customExamsList.appendChild(examCard);
  });

  // Add event listeners for edit and delete buttons
  document.querySelectorAll(".edit-exam-btn").forEach((btn) => {
    btn.addEventListener("click", handleEditExam);
  });

  document.querySelectorAll(".delete-exam-btn").forEach((btn) => {
    btn.addEventListener("click", handleDeleteExam);
  });
}

function openCustomExamModal(examId = null) {
  const modal = document.getElementById("custom-exam-modal");
  const modalTitle = document.getElementById("custom-exam-modal-title");
  const nameInput = document.getElementById("custom-exam-name-input");
  const dateInput = document.getElementById("custom-exam-date-input");
  
  if (!modal) return;

  editingExamId = examId;

  if (examId) {
    // Edit mode
    modalTitle.textContent = "Edit Custom Exam";
    getCustomExams().then((exams) => {
      const exam = exams.find((e) => e.id === examId);
      if (exam) {
        nameInput.value = exam.name;
        // Convert ISO date to datetime-local format
        const date = new Date(exam.date);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        dateInput.value = localDate.toISOString().slice(0, 16);
      }
    });
  } else {
    // Add mode
    modalTitle.textContent = "Add Custom Exam";
    nameInput.value = "";
    dateInput.value = "";
  }

  modal.showModal();
}

function closeCustomExamModal() {
  const modal = document.getElementById("custom-exam-modal");
  if (modal) {
    modal.close();
    editingExamId = null;
  }
}

async function handleSaveCustomExam(event) {
  event.preventDefault();
  
  const nameInput = document.getElementById("custom-exam-name-input");
  const dateInput = document.getElementById("custom-exam-date-input");
  
  const name = nameInput.value.trim();
  const dateValue = dateInput.value;
  
  if (!name || !dateValue) {
    alert("Please fill in all fields");
    return;
  }

  const date = new Date(dateValue);
  
  try {
    if (editingExamId) {
      // Update existing exam
      await updateCustomExam(editingExamId, name, date);
    } else {
      // Add new exam
      await addCustomExam(name, date);
    }
    
    closeCustomExamModal();
    await renderCustomExams();
  } catch (error) {
    alert(error.message);
  }
}

async function handleEditExam(event) {
  const examId = event.currentTarget.dataset.examId;
  openCustomExamModal(examId);
}

async function handleDeleteExam(event) {
  const examId = event.currentTarget.dataset.examId;
  
  if (confirm("Are you sure you want to delete this exam?")) {
    try {
      await deleteCustomExam(examId);
      await renderCustomExams();
    } catch (error) {
      alert("Failed to delete exam: " + error.message);
    }
  }
}

function initializeCustomExamsUI() {
  // Render custom exams
  renderCustomExams();

  // Add exam button
  const addExamBtn = document.getElementById("add-custom-exam-btn");
  if (addExamBtn) {
    addExamBtn.addEventListener("click", () => openCustomExamModal());
  }

  // Cancel button
  const cancelBtn = document.getElementById("cancel-custom-exam-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeCustomExamModal);
  }

  // Form submit
  const examForm = document.getElementById("custom-exam-form");
  if (examForm) {
    examForm.addEventListener("submit", handleSaveCustomExam);
  }
}
