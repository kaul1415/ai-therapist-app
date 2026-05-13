/* ═══════════════════════════════════════════════════
   MINDBLOOM v2.0 — script.js
   
   Sections:
   1.  Config & global state
   2.  App init
   3.  Authentication (Login / Signup / Logout)
   4.  Navigation
   5.  Dashboard
   6.  Chat (API + history storage)
   7.  Mood Tracker
   8.  Journal
   9.  Calendar
   10. History (Chat history + Activity log)
   11. Resources
   12. About (FAQ)
   13. Settings (font fix included)
   14. Activity logging
   15. Storage helpers
   16. Utility helpers
   17. API integration helpers
═══════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────
   1. CONFIG & GLOBAL STATE
───────────────────────────────────────────────────── */

const API_BASE = "http://localhost:5000/api";  // Updated to include /api

// Loaded fonts cache (to avoid duplicate <link> tags)
const loadedFonts = new Set(["DM Sans"]);

// Google Fonts URL map for supported font families
const FONT_URLS = {
  "Nunito": "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600&display=swap",
  "Lora": "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&display=swap",
  "Raleway": "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600&display=swap",
  "Quicksand": "https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600&display=swap",
};

// App state — everything lives here
const state = {
  currentPage: "dashboard",
  sessionId: null,          // active chat session ID (from backend)
  chatMode: "advice",
  currentUser: null,          // { id, name, email, createdAt }
  settings: {
    darkMode: false,
    fontFamily: "DM Sans",
    fontSize: 16,
    accentColor: "#3CBFA0",
    defaultMode: "advice",
    showTyping: true,
    moodReminder: false,
    breathingReminder: false,
  },
  backendAvailable: false,       // Track if backend is reachable
};

// Selected mood on mood page (temp)
let selectedMoodData = null;
// Selected journal entry ID being edited
let editingEntryId = null;
// Selected mood tag in journal editor
let editorMoodTag = null;
// Calendar state
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();
// Selected calendar date (YYYY-MM-DD)
let selectedCalDate = null;
// Resource filter
let currentResourceFilter = "all";
// Current history tab
let currentHistTab = "chats";

/* ─────────────────────────────────────────────────────
   DAILY CONTENT DATA
───────────────────────────────────────────────────── */

const DAILY_TIPS = [
  "Even 5 minutes of deep breathing can lower cortisol and calm your nervous system.",
  "Writing 3 things you're grateful for before bed can improve sleep quality over time.",
  "You don't need to solve everything today. Progress, not perfection.",
  "Drinking water is one of the simplest ways to improve mood and focus.",
  "It's okay to set boundaries. Saying 'no' is a form of self-care.",
  "A short walk outside can clear your head and reset your nervous system.",
  "Talking about your feelings isn't weakness — it's one of the bravest things you can do.",
  "Rest is not lazy. Your mind needs downtime just like your body does.",
  "Small acts of kindness — to others and yourself — compound over time.",
  "You've survived every hard day so far. Today can be one more.",
  "The present moment is the only place healing can happen.",
  "Comparison is the thief of joy. Your journey is uniquely yours.",
  "Name it to tame it: just labeling an emotion reduces its intensity.",
  "Perfectionism is the enemy of done — and often the enemy of wellbeing.",
  "One mindful breath can interrupt a spiral. Just one.",
];

const JOURNAL_PROMPTS = [
  "What's one thing that's been on your mind this week that you haven't said out loud yet?",
  "Describe a small moment today that brought you peace or joy.",
  "What would you tell your past self from one year ago?",
  "What does 'feeling okay' look like for you right now?",
  "Write about something you're grateful for that you often overlook.",
  "What's one thing you need but haven't asked for?",
  "Describe how you're feeling in three words — then explain each one.",
  "What's one thing you're proud of yourself for this week?",
  "What emotion have you been avoiding? What would happen if you let yourself feel it?",
  "If your feelings could speak right now, what would they say?",
  "What's weighing on you, and what part of it is actually within your control?",
  "Write a letter to your future self, six months from now.",
  "What does your ideal day look like? What's stopping you from having more of those?",
  "What belief about yourself might be holding you back?",
];

const RESOURCES_DATA = [
  { id: 1, category: "breathing", icon: "🌬️", iconBg: "rgba(60,191,160,0.12)", iconColor: "var(--mint)", title: "Box Breathing", tag: "Breathing", tagBg: "rgba(60,191,160,0.12)", tagColor: "var(--mint-d)", text: "Inhale for 4 counts, hold 4, exhale 4, hold 4. Repeat 4 times. Activates your parasympathetic nervous system and calms anxiety within minutes.", meta: "2–4 minutes", action: "Try It" },
  { id: 2, category: "breathing", icon: "🫁", iconBg: "rgba(107,184,232,0.12)", iconColor: "var(--sky)", title: "4-7-8 Breathing", tag: "Breathing", tagBg: "rgba(107,184,232,0.12)", tagColor: "var(--sky)", text: "Breathe in 4, hold 7, exhale slowly 8. Especially effective for falling asleep or calming down quickly.", meta: "3 minutes", action: "Learn More" },
  { id: 3, category: "anxiety", icon: "🧘", iconBg: "rgba(255,140,107,0.12)", iconColor: "var(--peach)", title: "5-4-3-2-1 Grounding", tag: "Anxiety", tagBg: "rgba(255,140,107,0.12)", tagColor: "var(--peach)", text: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Interrupts anxious thought spirals immediately.", meta: "3–5 minutes", action: "Try It" },
  { id: 4, category: "anxiety", icon: "✍️", iconBg: "rgba(60,191,160,0.12)", iconColor: "var(--mint)", title: "Thought Journaling", tag: "Anxiety", tagBg: "rgba(60,191,160,0.12)", tagColor: "var(--mint-d)", text: "Write anxious thoughts, then ask: Is this fact or assumption? What's the realistic outcome? Rewires negative thought patterns over time.", meta: "5–10 minutes", action: "Start Writing" },
  { id: 5, category: "sleep", icon: "😴", iconBg: "rgba(245,197,24,0.12)", iconColor: "var(--amber)", title: "Wind-Down Routine", tag: "Sleep", tagBg: "rgba(245,197,24,0.12)", tagColor: "#9a7a00", text: "Avoid screens 30–60 minutes before bed. Read, stretch, or listen to calm music. Consistency signals your brain that sleep is coming.", meta: "30–60 min before bed", action: "Learn More" },
  { id: 6, category: "sleep", icon: "🌡️", iconBg: "rgba(107,184,232,0.12)", iconColor: "var(--sky)", title: "Military Sleep Method", tag: "Sleep", tagBg: "rgba(107,184,232,0.12)", tagColor: "var(--sky)", text: "Relax face muscles, drop shoulders, let arms go limp, clear your mind for 10 seconds. Reportedly helps most people sleep within 2 minutes.", meta: "2–5 minutes", action: "Try It" },
  { id: 7, category: "stress", icon: "💆", iconBg: "rgba(255,140,107,0.12)", iconColor: "var(--peach)", title: "Progressive Muscle Relaxation", tag: "Stress", tagBg: "rgba(255,140,107,0.12)", tagColor: "var(--peach)", text: "Tense each muscle group for 5 seconds, then release for 30. Start at your feet, work up to your face. Releases physical tension from chronic stress.", meta: "10–15 minutes", action: "Start Now" },
  { id: 8, category: "stress", icon: "🚶", iconBg: "rgba(60,191,160,0.12)", iconColor: "var(--mint)", title: "10-Minute Mindful Walk", tag: "Stress", tagBg: "rgba(60,191,160,0.12)", tagColor: "var(--mint-d)", text: "Walk outside and focus only on what you see, hear, feel. No phone. Even a brief nature walk lowers cortisol by up to 15% and boosts mood for hours.", meta: "10 minutes", action: "Go Outside" },
  { id: 9, category: "motivation", icon: "⭐", iconBg: "rgba(245,197,24,0.12)", iconColor: "var(--amber)", title: "The 2-Minute Rule", tag: "Motivation", tagBg: "rgba(245,197,24,0.12)", tagColor: "#9a7a00", text: "If it takes under 2 minutes, do it now. For bigger tasks, just commit to starting for 2 minutes. Getting started is the hardest part.", meta: "Ongoing habit", action: "Apply It" },
  { id: 10, category: "motivation", icon: "🎯", iconBg: "rgba(60,191,160,0.12)", iconColor: "var(--mint)", title: "Identity-Based Habits", tag: "Motivation", tagBg: "rgba(60,191,160,0.12)", tagColor: "var(--mint-d)", text: "Instead of 'I want to exercise,' say 'I am someone who moves their body.' Identity shifts are more powerful than willpower alone.", meta: "Long-term practice", action: "Learn More" },
];

const FAQ_DATA = [
  { q: "Is MindBloom a replacement for therapy?", a: "No. MindBloom is a wellness support tool for everyday emotional self-care. If you're experiencing serious mental health issues, please seek help from a licensed professional or call a crisis line. Bloom can be a helpful complement to therapy, but not a substitute." },
  { q: "Who sees my chats and journal entries?", a: "Your journal entries and mood logs are stored only in your browser's local storage — they never leave your device. Chat messages are sent to the AI backend for processing but are not permanently stored on any server. MindBloom does not sell or share your data." },
  { q: "What's the difference between the three chat modes?", a: "Vent Mode: Bloom just listens — no advice, no suggestions. Perfect for when you need to let it all out. Advice Mode: Bloom offers practical coping strategies and perspectives. Clarity Mode: Bloom asks thoughtful questions to help you think through situations yourself." },
  { q: "Can I lose my journal entries if I clear my browser?", a: "Yes — since journal entries are stored in localStorage, clearing your browser data will delete them. We recommend copying important entries to a notes app as a backup. Future versions of MindBloom will support cloud backup." },
  { q: "What if I'm in a mental health crisis?", a: "Please reach out to a crisis helpline immediately. In the Resources page, you'll find a direct link to findahelpline.com which lists crisis services in your country. MindBloom's AI is not equipped to handle emergencies." },
  { q: "How do I get the most out of MindBloom?", a: "Use it daily — even for just 5 minutes. Log your mood in the morning. Write a short journal entry at night. Chat with Bloom when something's on your mind. Over time, the patterns you discover about yourself become the most valuable part." },
];

const DEMO_RESPONSES = {
  vent: [
    "I hear you. It sounds like a lot has been building up. You don't have to explain or justify anything — just let it out. I'm here.",
    "That sounds exhausting. Thank you for trusting me with this. Take your time.",
    "Of course you feel that way. Anyone in your situation would. What's the heaviest part for you right now?",
    "You don't have to figure anything out right now. I'm just here to listen.",
  ],
  advice: [
    "That makes a lot of sense. Here's one thing that might help: ask yourself what the smallest possible step is — not to fix everything, just to feel slightly less stuck.",
    "What you're describing sounds like a lot to hold. Try writing down everything on your mind for 5 minutes — just let it spill out. It separates what's urgent from what can wait.",
    "Anxiety often tricks us into thinking everything needs solving right now. What's actually within your control today versus what isn't?",
    "A 10-minute 'worry window' daily can help. Write worries down, then park them until that time. It's surprisingly effective for breaking the constant-thinking loop.",
  ],
  clarity: [
    "Interesting. Let me ask: if your closest friend came to you with this exact situation, what would you tell them?",
    "What's the story you're telling yourself about this? Could there be another story that's equally true?",
    "You said you feel stuck. Stuck between what and what exactly? Naming both ends of the tension often makes it easier to move.",
    "What would you need to believe about yourself to feel okay about this — even just temporarily?",
  ],
};

/* ─────────────────────────────────────────────────────
   2. APP INITIALIZATION
───────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function () {
  loadSettingsFromStorage();
  checkAuthAndInit();
  // Sidebar close on overlay
  document.getElementById("sidebarOverlay").addEventListener("click", closeSidebar);
  // Password strength checker
  const pwInput = document.getElementById("signupPassword");
  if (pwInput) pwInput.addEventListener("input", checkPasswordStrength);
});

/**
 * Check if user is logged in; show auth screen or app accordingly.
 */
function checkAuthAndInit() {
  const session = loadSession();
  if (session && session.userId) {
    const user = getUserById(session.userId);
    if (user) {
      state.currentUser = user;
      hideAuthScreen();
      initApp();
      return;
    }
  }
  showAuthScreen();
}

/**
 * Initialize the app after successful login.
 */
async function initApp() {
  const u = state.currentUser;
  if (!u) return;

  // Update UI with user info
  updateUserUI(u.name);

  // Apply saved settings
  applySettings();

  // Check backend availability
  await checkBackendHealth();

  // Sync data from backend if available
  if (state.backendAvailable) {
    await syncUserDataFromBackend();
  }

  // Build resources & FAQ (static, done once)
  buildResourcesGrid();
  buildFAQ();

  // Init dashboard content
  setGreeting();
  setDailyTip();
  setDashPrompt();
  updateDashboardStats();
  renderDashActivity();

  // Start chat session
  if (state.backendAvailable) {
    await createChatSession();
  }

  // Init mood page
  loadMoodHistory();
  renderMoodLogList();
  updateMoodPageStats();

  // Init journal
  renderJournalList();
  setJournalWelcomePrompt();

  // Init calendar
  renderCalendar(calYear, calMonth);

  // Init history
  renderChatHistory();
  renderActivityLog();

  // Settings page info
  const emailEl = document.getElementById("settingsEmail");
  const sinceEl = document.getElementById("memberSince");
  if (emailEl) emailEl.textContent = u.email;
  if (sinceEl) sinceEl.textContent = formatDateShort(new Date(u.createdAt));

  const nameInput = document.getElementById("displayNameInput");
  if (nameInput) nameInput.value = u.name || "";
}

function updateUserUI(name) {
  const initial = (name || "U").charAt(0).toUpperCase();
  const els = [
    document.getElementById("sidebarAvatar"),
    document.getElementById("topbarAvatar"),
  ];
  els.forEach(function (el) { if (el) el.textContent = initial; });
  const nameEl = document.getElementById("sidebarName");
  if (nameEl) nameEl.textContent = name || "Friend";
  const welcomeNameEl = document.getElementById("welcomeName");
  if (welcomeNameEl) welcomeNameEl.textContent = (name || "Friend").split(" ")[0];
  updateStreakDisplay();
}

/* ─────────────────────────────────────────────────────
   17. API INTEGRATION HELPERS
───────────────────────────────────────────────────── */

/**
 * Generic API request handler with auth and error handling
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(API_BASE + endpoint, options);

    if (res.status === 401) {
      // Token invalid or expired
      doLogout();
      showToast("Session expired. Please log in again.");
      return null;
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }

    // Mark backend as available
    state.backendAvailable = true;
    return await res.json();

  } catch (error) {
    console.error('API request failed:', error);
    state.backendAvailable = false;
    return null;
  }
}

/**
 * Check if backend is reachable
 */
async function checkBackendHealth() {
  try {
    const res = await fetch(API_BASE, { method: 'GET' });
    if (res.ok) {
      state.backendAvailable = true;
    }
  } catch (error) {
    state.backendAvailable = false;
    console.warn('Backend not available, using localStorage fallback');
  }
}

/**
 * Sync user data from backend to localStorage
 */
async function syncUserDataFromBackend() {
  if (!state.backendAvailable) return;

  try {
    // Sync moods
    const moods = await apiRequest('/mood');
    if (moods) {
      saveUserData('moods', moods);
    }

    // Sync journal entries
    const entries = await apiRequest('/journal');
    if (entries) {
      saveUserData('journal', entries);
    }

    // Sync chat sessions
    const sessions = await apiRequest('/chat/sessions');
    if (sessions) {
      saveUserData('chatSessions', sessions);
    }
  } catch (error) {
    console.error('Failed to sync data from backend:', error);
  }
}

/* ─────────────────────────────────────────────────────
   3. AUTHENTICATION
───────────────────────────────────────────────────── */

function showAuthScreen() { document.getElementById("authScreen").classList.remove("hidden"); document.getElementById("app").classList.add("hidden"); }
function hideAuthScreen() { document.getElementById("authScreen").classList.add("hidden"); document.getElementById("app").classList.remove("hidden"); }

function switchAuthTab(tab) {
  document.getElementById("loginForm").classList.toggle("hidden", tab !== "login");
  document.getElementById("signupForm").classList.toggle("hidden", tab !== "signup");
  document.getElementById("loginTab").classList.toggle("active", tab === "login");
  document.getElementById("signupTab").classList.toggle("active", tab === "signup");
  clearAuthErrors();
}

function clearAuthErrors() {
  ["loginErr", "signupErr"].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) { el.textContent = ""; el.classList.add("hidden"); }
  });
}

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
}

function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === "password") { input.type = "text"; btn.textContent = "🙈"; }
  else { input.type = "password"; btn.textContent = "👁"; }
}

function checkPasswordStrength() {
  const val = document.getElementById("signupPassword").value;
  const bar = document.getElementById("passStrength");
  if (!bar) return;
  bar.className = "pass-strength";
  if (val.length === 0) return;
  if (val.length < 6) bar.classList.add("weak");
  else if (val.length < 10 || !/[A-Z]/.test(val) || !/[0-9]/.test(val)) bar.classList.add("fair");
  else bar.classList.add("strong");
}

/**
 * Login: validates fields, checks against backend API
 */
async function doLogin() {
  clearAuthErrors();
  const email = (document.getElementById("loginEmail").value || "").trim().toLowerCase();
  const password = (document.getElementById("loginPassword").value || "");
  if (!email || !password) return showAuthError("loginErr", "Please fill in all fields.");
  if (!isValidEmail(email)) return showAuthError("loginErr", "Please enter a valid email address.");

  const btn = document.getElementById("loginBtn");
  btn.disabled = true; btn.textContent = "Signing in...";

  try {
    const result = await apiRequest('/auth/login', 'POST', { email, password });

    if (!result) {
      // Backend failed, fallback to localStorage
      const users = getAllUsers();
      const user = users.find(function (u) { return u.email === email && u.password === password; });
      if (!user) {
        showAuthError("loginErr", "Incorrect email or password. Please try again.");
        return;
      }
      state.currentUser = user;
      saveSession({ userId: user.id });
      hideAuthScreen();
      logActivity("other", "Signed in to MindBloom (offline mode)");
      initApp();
      showToast("Welcome back, " + user.name.split(" ")[0] + "! 🌱 (offline)");
    } else {
      // Backend success
      const { user, token } = result;
      localStorage.setItem('token', token);
      state.currentUser = user;
      saveSession({ userId: user.id });
      hideAuthScreen();
      logActivity("other", "Signed in to MindBloom");
      initApp();
      showToast("Welcome back, " + user.name.split(" ")[0] + "! 🌱");
    }
  } catch (e) {
    showAuthError("loginErr", "Something went wrong. Please try again.");
  } finally {
    btn.disabled = false; btn.textContent = "Sign In";
  }
}

/**
 * Signup: validates fields, creates a new user via backend
 */
async function doSignup() {
  clearAuthErrors();
  const name = (document.getElementById("signupName").value || "").trim();
  const email = (document.getElementById("signupEmail").value || "").trim().toLowerCase();
  const password = (document.getElementById("signupPassword").value || "");
  const confirm = (document.getElementById("signupConfirm").value || "");

  if (!name || !email || !password || !confirm) return showAuthError("signupErr", "Please fill in all fields.");
  if (name.length < 2) return showAuthError("signupErr", "Name must be at least 2 characters.");
  if (!isValidEmail(email)) return showAuthError("signupErr", "Please enter a valid email address.");
  if (password.length < 8) return showAuthError("signupErr", "Password must be at least 8 characters.");
  if (password !== confirm) return showAuthError("signupErr", "Passwords do not match.");

  const btn = document.getElementById("signupBtn");
  btn.disabled = true; btn.textContent = "Creating account...";

  try {
    const result = await apiRequest('/auth/register', 'POST', { name, email, password });

    if (!result) {
      // Backend failed, fallback to localStorage
      const users = getAllUsers();
      if (users.find(function (u) { return u.email === email; })) {
        showAuthError("signupErr", "An account with this email already exists.");
        return;
      }
      const newUser = { id: "user_" + Date.now(), name, email, password, createdAt: new Date().toISOString() };
      users.push(newUser);
      saveAllUsers(users);
      state.currentUser = newUser;
      saveSession({ userId: newUser.id });
      hideAuthScreen();
      initApp();
      logActivity("other", "Created MindBloom account (offline mode)");
      showToast("Welcome to MindBloom, " + name.split(" ")[0] + "! 🌱 (offline)");
    } else {
      // Backend success
      const { user, token } = result;
      localStorage.setItem('token', token);
      state.currentUser = user;
      saveSession({ userId: user.id });
      hideAuthScreen();
      initApp();
      logActivity("other", "Created MindBloom account");
      showToast("Welcome to MindBloom, " + name.split(" ")[0] + "! 🌱");
    }
  } catch (e) {
    showAuthError("signupErr", "Something went wrong. Please try again.");
  } finally {
    btn.disabled = false; btn.textContent = "Create Account";
  }
}

function doLogout() {
  if (!confirm("Sign out of MindBloom?")) return;
  localStorage.removeItem('token');
  clearSession();
  state.currentUser = null;
  state.sessionId = null;
  showAuthScreen();
  // Reset page to dashboard for next login
  state.currentPage = "dashboard";
}

/* ─────────────────────────────────────────────────────
   4. NAVIGATION
───────────────────────────────────────────────────── */

function navigate(pageName) {
  document.querySelectorAll(".page").forEach(function (p) { p.classList.remove("active"); });
  const target = document.getElementById("page-" + pageName);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(function (item) {
    item.classList.toggle("active", item.dataset.page === pageName);
  });

  const titles = { dashboard: "Dashboard", chat: "Chat with Bloom", mood: "Mood Tracker", journal: "Journal", calendar: "Calendar", history: "History", resources: "Resources", about: "About", settings: "Settings" };
  const t = document.getElementById("topbarTitle");
  if (t) t.textContent = titles[pageName] || pageName;

  state.currentPage = pageName;
  closeSidebar();

  if (pageName === "chat") { setTimeout(function () { const i = document.getElementById("chatInput"); if (i) i.focus(); }, 100); }
  if (pageName === "dashboard") { updateDashboardStats(); renderDashActivity(); }
  if (pageName === "history") { renderChatHistory(); renderActivityLog(); }
  if (pageName === "calendar") { renderCalendar(calYear, calMonth); }
  if (pageName === "journal") { renderJournalList(); }
  if (pageName === "mood") { renderMoodLogList(); updateMoodPageStats(); }
}

/* ─────────────────────────────────────────────────────
   5. DASHBOARD
───────────────────────────────────────────────────── */

function setGreeting() {
  const h = new Date().getHours();
  const g = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  const el = document.getElementById("timeGreeting");
  if (el) el.textContent = g;
}

function setDailyTip() {
  const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const el = document.getElementById("dailyTip");
  if (el) el.textContent = DAILY_TIPS[day % DAILY_TIPS.length];
}

function setDashPrompt() {
  const el = document.getElementById("dashPrompt");
  if (el) el.textContent = '"' + JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)] + '"';
}

function updateDashboardStats() {
  const uid = state.currentUser?.id;
  if (!uid) return;
  const moods = loadUserData("moods") || [];
  const entries = loadUserData("journal") || [];
  const chats = loadUserData("chatSessions") || [];
  const streak = calcStreak(moods);

  setEl("dashStreak", streak);
  setEl("dashSessions", chats.length);
  setEl("dashJournals", entries.length);
  setEl("dashMoods", moods.length);

  const streakEl = document.getElementById("sidebarStreak");
  if (streakEl) streakEl.textContent = "🔥 " + streak + " day streak";
}

function renderDashActivity() {
  const activity = loadUserData("activity") || [];
  const container = document.getElementById("dashActivity");
  if (!container) return;
  const recent = activity.slice(-6).reverse();
  if (recent.length === 0) {
    container.innerHTML = '<div class="empty-state">No activity yet. Start your journey above! 🌱</div>';
    return;
  }
  container.innerHTML = recent.map(function (a) {
    return `<div class="activity-item">
      <span class="activity-icon">${a.icon || "✦"}</span>
      <span>${escHtml(a.text)}</span>
      <span class="activity-time">${a.timeStr}</span>
    </div>`;
  }).join("");
}

function updateStreakDisplay() {
  const moods = loadUserData("moods") || [];
  const streak = calcStreak(moods);
  const el = document.getElementById("sidebarStreak");
  if (el) el.textContent = "🔥 " + streak + " day streak";
}

function quickMood(name, emoji) {
  const scoreMap = { Great: 5, Good: 4, Okay: 3, Sad: 2, Stressed: 1 };
  const entry = { name, emoji, score: scoreMap[name] || 3, note: "", time: new Date().toISOString(), timeStr: formatTime(new Date()) };
  const moods = loadUserData("moods") || [];
  moods.push(entry);
  saveUserData("moods", moods);
  updateDashboardStats();
  renderMoodLogList();
  updateMoodPageStats();
  renderDashActivity();
  logActivity("mood", "Logged mood: " + name + " " + emoji);
  showToast(emoji + " Mood logged: " + name + "!");
}

/* ─────────────────────────────────────────────────────
   6. CHAT
───────────────────────────────────────────────────── */

async function createChatSession() {
  const display = document.getElementById("sessionIdDisplay");
  try {
    const result = await apiRequest('/chat/sessions', 'POST', { title: "New session" });

    if (!result) {
      // Backend failed, use local session ID
      state.sessionId = "local-" + Date.now();
      if (display) display.textContent = state.sessionId.toString().slice(-8) + "...";
      console.warn('Backend unavailable, using local session ID');
    } else {
      const session = result.session || result.data || result;
      state.sessionId = session._id || session.id;
      if (display) display.textContent = state.sessionId.toString().slice(-8) + "...";
      logActivity("chat", "Started new chat session");
    }
  } catch (e) {
    state.sessionId = "local-" + Date.now();
    if (display) display.textContent = "offline";
    console.error("Failed to create chat session:", e);
  }
}

function startNewChat() {
  // Save current session to history before clearing
  saveCurrentChatToHistory();
  // Clear UI
  const area = document.getElementById("messagesArea");
  if (area) area.querySelectorAll(".message-row:not(#welcomeMsg), .typing-row, .error-bubble").forEach(function (el) { el.remove(); });
  document.getElementById("welcomeMsg").style.display = "";
  const sw = document.getElementById("suggestionsWrap");
  if (sw) sw.style.display = "";
  state.sessionId = null;
  createChatSession();
  showToast("New chat started 🌱");
}

/** Save the current chat messages to history in localStorage */
function saveCurrentChatToHistory() {
  const area = document.getElementById("messagesArea");
  if (!area) return;
  const rows = area.querySelectorAll(".message-row:not(#welcomeMsg)");
  if (rows.length === 0) return;

  const messages = [];
  rows.forEach(function (row) {
    const isUser = row.classList.contains("user-row");
    const bubble = row.querySelector(".msg-bubble");
    const time = row.querySelector(".msg-time");
    if (bubble) {
      messages.push({
        role: isUser ? "user" : "ai",
        text: bubble.innerText,
        time: time ? time.textContent : formatTime(new Date()),
      });
    }
  });

  const firstUserMsg = messages.find(function (m) { return m.role === "user"; });
  const title = firstUserMsg
    ? firstUserMsg.text.slice(0, 50) + (firstUserMsg.text.length > 50 ? "…" : "")
    : "Chat session";

  const sessions = loadUserData("chatSessions") || [];
  sessions.unshift({
    id: state.sessionId || ("local-" + Date.now()),
    title: title,
    mode: state.chatMode,
    messages: messages,
    createdAt: new Date().toISOString(),
    timeStr: formatDateShort(new Date()),
    msgCount: messages.length,
  });
  // Keep last 50 sessions
  saveUserData("chatSessions", sessions.slice(0, 50));
}

function setChatMode(mode, btn) {
  state.chatMode = mode;
  document.querySelectorAll(".mode-btn").forEach(function (b) { b.classList.remove("active"); });
  if (btn) btn.classList.add("active");
  const labels = { advice: "💡 Advice Mode", vent: "🌊 Vent Mode", clarity: "🔮 Clarity Mode" };
  const ml = document.getElementById("sessionModeLabel");
  if (ml) ml.textContent = labels[mode] || mode;
}

function useSuggestion(chip) {
  const input = document.getElementById("chatInput");
  if (input) { input.value = chip.textContent; autoGrow(input); input.focus(); }
  const sw = document.getElementById("suggestionsWrap");
  if (sw) sw.style.display = "none";
}

function handleChatKey(e) {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  updateCharCount();
}

function updateCharCount() {
  const input = document.getElementById("chatInput");
  const counter = document.getElementById("charCount");
  if (!input || !counter) return;
  const len = input.value.length;
  counter.textContent = len + " / 500";
  counter.classList.toggle("char-warn", len > 450);
}

function autoGrow(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
  updateCharCount();
}

async function sendMessage() {
  const input = document.getElementById("chatInput");
  const sndBtn = document.getElementById("sendBtn");
  if (!input) return;
  const text = input.value.trim();
  if (!text || text.length > 500) return;

  const sw = document.getElementById("suggestionsWrap");
  if (sw) sw.style.display = "none";
  document.getElementById("welcomeMsg").style.display = "none";

  addChatMessage(text, "user");
  input.value = ""; input.style.height = "auto"; updateCharCount();
  if (sndBtn) sndBtn.disabled = true;

  let typingEl = null;
  if (state.settings.showTyping) typingEl = showTypingBubble();
  scrollChat();

  if (!state.sessionId) await createChatSession();

  try {
    const result = await apiRequest('/chat/sessions/' + state.sessionId + '/messages', 'POST', { message: text, mode: state.chatMode });

    if (!result) {
      // Backend failed, use demo response
      if (typingEl) typingEl.remove();
      const replies = DEMO_RESPONSES[state.chatMode] || DEMO_RESPONSES.advice;
      addChatMessage(replies[Math.floor(Math.random() * replies.length)], "ai");
      const errEl = document.createElement("div");
      errEl.className = "error-bubble"; errEl.textContent = "⚠️ Backend unavailable. Showing demo response.";
      document.getElementById("messagesArea")?.appendChild(errEl);
    } else {
      // Backend success
      if (typingEl) typingEl.remove();
      console.log("Backend response:", result);

      const reply =
        result?.reply ||
        result?.message ||
        result?.content ||
        result?.response ||
        result?.data?.reply ||
        result?.data?.message?.content ||
        result?.data?.content ||
        result?.aiMessage?.content ||
        result?.message?.content ||
        result?.data?.aiMessage?.content ||
        "I'm here to listen. Could you tell me more?";
      addChatMessage(reply, "ai");
      logActivity("chat", "Chatted with Bloom (" + state.chatMode + " mode)");
    }
  } catch (err) {
    if (typingEl) typingEl.remove();
    const replies = DEMO_RESPONSES[state.chatMode] || DEMO_RESPONSES.advice;
    addChatMessage(replies[Math.floor(Math.random() * replies.length)], "ai");
    console.error("Send message error:", err);
  }

  if (sndBtn) sndBtn.disabled = false;
  scrollChat();
  if (input) input.focus();
  updateDashboardStats();
}

function addChatMessage(text, role) {
  const area = document.getElementById("messagesArea");
  if (!area) return;
  const isUser = role === "user";
  const init = (state.currentUser?.name || "U").charAt(0).toUpperCase();
  area.insertAdjacentHTML("beforeend", `
    <div class="message-row ${isUser ? "user-row" : "ai-row"}">
      <div class="msg-avatar ${isUser ? "user-avatar" : "ai-avatar"}">${isUser ? init : "🌿"}</div>
      <div class="msg-col">
        <div class="msg-bubble ${isUser ? "user-bubble" : "ai-bubble"}">${escHtml(text).replace(/\n/g, "<br/>")}</div>
        <div class="msg-time">${formatTime(new Date())}</div>
      </div>
    </div>`);
  scrollChat();
}

function showTypingBubble() {
  const area = document.getElementById("messagesArea");
  if (!area) return null;
  area.insertAdjacentHTML("beforeend", `
    <div class="message-row ai-row typing-row" id="typingRow">
      <div class="msg-avatar ai-avatar">🌿</div>
      <div class="msg-col">
        <div class="typing-bubble"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>
        <div class="msg-time">Bloom is typing...</div>
      </div>
    </div>`);
  scrollChat();
  return document.getElementById("typingRow");
}

function scrollChat() { const a = document.getElementById("messagesArea"); if (a) a.scrollTop = a.scrollHeight; }

/* ─────────────────────────────────────────────────────
   7. MOOD TRACKER
───────────────────────────────────────────────────── */

function loadMoodHistory() {
  /* data loaded on demand via loadUserData("moods") */
}

async function selectMood(btn) {
  document.querySelectorAll(".mood-btn").forEach(function (b) { b.classList.remove("selected"); });
  btn.classList.add("selected");
  const emoji = btn.querySelector(".mood-emoji").textContent;
  const name = btn.querySelector(".mood-name").textContent;
  const score = parseInt(btn.dataset.score) || 3;
  selectedMoodData = { emoji, name, score };
  const d = document.getElementById("selectedMoodDisplay");
  const e = document.getElementById("selectedMoodEmoji");
  const n = document.getElementById("selectedMoodName");
  if (d) d.classList.remove("hidden");
  if (e) e.textContent = emoji;
  if (n) n.textContent = name;
  const lb = document.getElementById("logMoodBtn");
  if (lb) lb.disabled = false;
}

async function logMood() {
  if (!selectedMoodData) return showToast("Please select a mood first!");
  const note = (document.getElementById("moodNote")?.value || "").trim();
  const entry = { ...selectedMoodData, note, time: new Date().toISOString(), timeStr: formatTime(new Date()) };

  // Try backend first
  const result = await apiRequest('/mood', 'POST', entry);

  if (result) {
    // Backend saved successfully, sync moods from backend
    const updatedMoods = await apiRequest('/mood', 'GET');
    if (updatedMoods) {
      saveUserData('moods', updatedMoods);
    }
  } else {
    // Backend failed, fallback to localStorage
    const moods = loadUserData("moods") || [];
    moods.push(entry);
    saveUserData("moods", moods);
    showToast("Backend unavailable, saved locally.");
  }

  // Update UI (reads from localStorage which may have been updated by backend sync)
  renderMoodLogList();
  updateMoodPageStats();
  updateDashboardStats();
  updateStreakDisplay();
  logActivity("mood", "Logged mood: " + entry.name + " " + entry.emoji);

  // Reset UI
  document.querySelectorAll(".mood-btn").forEach(function (b) { b.classList.remove("selected"); });
  const d = document.getElementById("selectedMoodDisplay"); if (d) d.classList.add("hidden");
  const noteInput = document.getElementById("moodNote"); if (noteInput) noteInput.value = "";
  const lb = document.getElementById("logMoodBtn"); if (lb) lb.disabled = true;
  selectedMoodData = null;

  showToast(entry.emoji + " Mood logged: " + entry.name);
}

function renderMoodLogList() {
  const moods = loadUserData("moods") || [];
  const container = document.getElementById("moodLogList");
  if (!container) return;
  if (moods.length === 0) { container.innerHTML = '<div class="empty-state">No moods logged yet. 🌱</div>'; return; }
  container.innerHTML = moods.slice().reverse().map(function (m) {
    const w = (m.score / 5) * 100;
    return `<div class="mood-log-item">
      <span class="mli-emoji">${m.emoji}</span>
      <div class="mli-info">
        <div class="mli-name">${escHtml(m.name)}</div>
        ${m.note ? '<div class="mli-note">' + escHtml(m.note) + '</div>' : ""}
        <div class="mli-bar"><div class="mli-bar-track"><div class="mli-bar-fill" style="width:${w}%"></div></div></div>
      </div>
      <span class="mli-score">${m.score}/5</span>
      <span class="mli-time">${m.timeStr}</span>
    </div>`;
  }).join("");
}

function updateMoodPageStats() {
  const moods = loadUserData("moods") || [];
  setEl("totalLogs", moods.length);
  if (moods.length > 0) {
    const avg = moods.reduce(function (s, m) { return s + m.score; }, 0) / moods.length;
    setEl("avgScore", avg.toFixed(1));
  } else setEl("avgScore", "—");
  setEl("topMoodStat", getTopMoodEmoji(moods) || "—");
  const today = new Date().toDateString();
  setEl("todayCount", moods.filter(function (m) { return new Date(m.time).toDateString() === today; }).length);
}

function getTopMoodEmoji(moods) {
  if (!moods || moods.length === 0) return "";
  const counts = {};
  moods.forEach(function (m) { counts[m.name] = (counts[m.name] || 0) + 1; });
  let top = ""; let max = 0;
  Object.keys(counts).forEach(function (n) { if (counts[n] > max) { max = counts[n]; top = n; } });
  const found = moods.find(function (m) { return m.name === top; });
  return found ? found.emoji : "";
}

function clearMoodHistory() {
  if (!confirm("Clear all mood history? This cannot be undone.")) return;
  saveUserData("moods", []);
  renderMoodLogList(); updateMoodPageStats(); updateDashboardStats();
  showToast("Mood history cleared.");
}

/* ─────────────────────────────────────────────────────
   8. JOURNAL
───────────────────────────────────────────────────── */

function getJournalEntries() { return loadUserData("journal") || []; }
function saveJournalEntries(entries) { saveUserData("journal", entries); }

function setJournalWelcomePrompt() {
  const el = document.getElementById("jwPromptCard");
  if (el) el.textContent = '"' + JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)] + '"';
}

function renderJournalList() {
  const entries = getJournalEntries();
  const query = (document.getElementById("journalSearch")?.value || "").toLowerCase();
  const container = document.getElementById("journalEntryList");
  if (!container) return;

  let filtered = entries;
  if (query) {
    filtered = entries.filter(function (e) {
      return e.title.toLowerCase().includes(query) ||
        e.content.toLowerCase().includes(query) ||
        (e.moodName && e.moodName.toLowerCase().includes(query));
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state">' + (query ? 'No entries match your search.' : 'No entries yet.<br>Click <strong>+ New Entry</strong> to begin.') + '</div>';
    return;
  }

  // Show newest first
  container.innerHTML = filtered.slice().reverse().map(function (entry) {
    const isActive = editingEntryId === entry.id;
    const preview = entry.content ? entry.content.slice(0, 60).replace(/\n/g, " ") : "";
    return `<div class="je-item ${isActive ? "active" : ""}" onclick="openJournalEditor('${entry.id}')">
      <div class="je-date">${formatDateShort(new Date(entry.date || entry.createdAt))}</div>
      <div class="je-title">${entry.title ? escHtml(entry.title) : "<em>Untitled entry</em>"}</div>
      ${preview ? '<div class="je-preview">' + escHtml(preview) + '</div>' : ""}
      ${entry.moodEmoji ? '<div class="je-mood">' + entry.moodEmoji + '</div>' : ""}
    </div>`;
  }).join("");
}

function openJournalEditor(entryId) {
  editingEntryId = entryId;
  editorMoodTag = null;

  // Show editor, hide welcome
  document.getElementById("journalWelcome").classList.add("hidden");
  const editor = document.getElementById("journalEditor");
  editor.classList.remove("hidden");

  // Update active state in list
  document.querySelectorAll(".je-item").forEach(function (el) { el.classList.remove("active"); });
  if (entryId) {
    const activeEl = document.querySelector(`.je-item[onclick="openJournalEditor('${entryId}')"]`);
    if (activeEl) activeEl.classList.add("active");
  }

  if (entryId) {
    // Editing existing entry
    const entry = getJournalEntries().find(function (e) { return e.id === entryId; });
    if (!entry) return;
    document.getElementById("editorDate").value = entry.date || todayStr();
    document.getElementById("editorTitle").value = entry.title || "";
    document.getElementById("editorContent").value = entry.content || "";
    document.getElementById("editorEntryId").value = entryId;
    // Restore mood tag
    if (entry.moodEmoji) {
      document.querySelectorAll(".mood-tag").forEach(function (t) {
        t.classList.toggle("selected", t.dataset.emoji === entry.moodEmoji);
      });
      editorMoodTag = { emoji: entry.moodEmoji, name: entry.moodName };
    } else {
      document.querySelectorAll(".mood-tag").forEach(function (t) { t.classList.remove("selected"); });
    }
    hidePromptBanner();
    setEl("editorSaveStatus", "Editing entry");
  } else {
    // New entry
    document.getElementById("editorDate").value = todayStr();
    document.getElementById("editorTitle").value = "";
    document.getElementById("editorContent").value = "";
    document.getElementById("editorEntryId").value = "";
    document.querySelectorAll(".mood-tag").forEach(function (t) { t.classList.remove("selected"); });
    hidePromptBanner();
    setEl("editorSaveStatus", "New entry");
    // Inject a random prompt automatically
    injectPrompt();
  }
  updateEditorWordCount();
}

function closeJournalEditor() {
  editingEntryId = null;
  document.getElementById("journalWelcome").classList.remove("hidden");
  document.getElementById("journalEditor").classList.add("hidden");
  document.querySelectorAll(".je-item").forEach(function (el) { el.classList.remove("active"); });
}

function tagMood(btn) {
  document.querySelectorAll(".mood-tag").forEach(function (t) { t.classList.remove("selected"); });
  btn.classList.add("selected");
  editorMoodTag = { emoji: btn.dataset.emoji, name: btn.dataset.name };
}

function injectPrompt() {
  const prompt = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
  const banner = document.getElementById("editorPromptBanner");
  const text = document.getElementById("editorPromptText");
  if (banner) banner.classList.remove("hidden");
  if (text) text.textContent = prompt;
}

function hidePromptBanner() {
  const banner = document.getElementById("editorPromptBanner");
  if (banner) banner.classList.add("hidden");
}

function updateEditorWordCount() {
  const content = document.getElementById("editorContent")?.value || "";
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  setEl("editorWordCount", words + " word" + (words !== 1 ? "s" : ""));
}

async function saveJournalEntry() {
  const date = document.getElementById("editorDate")?.value || todayStr();
  const title = document.getElementById("editorTitle")?.value.trim() || "";
  const content = document.getElementById("editorContent")?.value.trim() || "";
  const id = document.getElementById("editorEntryId")?.value;

  if (!content) { showToast("Please write something before saving! ✍️"); return; }

  const entries = getJournalEntries();
  const now = new Date().toISOString();

  if (id) {
    // Update existing
    const idx = entries.findIndex(function (e) { return e.id === id; });
    if (idx >= 0) {
      entries[idx] = { ...entries[idx], title, content, date, moodEmoji: editorMoodTag?.emoji || "", moodName: editorMoodTag?.name || "", updatedAt: now };
    }
  } else {
    // Create new
    const newEntry = {
      id: "j_" + Date.now(),
      title, content, date,
      moodEmoji: editorMoodTag?.emoji || "",
      moodName: editorMoodTag?.name || "",
      createdAt: now, updatedAt: now,
    };
    entries.push(newEntry);
    editingEntryId = newEntry.id;
    document.getElementById("editorEntryId").value = newEntry.id;
    logActivity("journal", "Wrote journal entry" + (title ? ': "' + title + '"' : ""));
  }

  // Try backend first
  const payload = {
    title,
    content,
    date,
    moodEmoji: editorMoodTag?.emoji || "",
    moodName: editorMoodTag?.name || "",
    ...(id && { id }) // include id for updates
  };

  const result = await apiRequest(id ? '/journal/' + id : '/journal', id ? 'PUT' : 'POST', payload);

  if (result) {
    // Backend saved successfully, sync journal entries from backend
    const updatedEntries = await apiRequest('/journal', 'GET');
    if (updatedEntries) {
      saveUserData('journal', updatedEntries);
    }
  } else {
    // Backend failed, save to localStorage
    saveJournalEntries(entries);
  }

  renderJournalList();
  updateDashboardStats();
  setEl("editorSaveStatus", "Saved ✓ " + formatTime(new Date()));
  showToast("Journal entry saved! 📓");
}

function clearAllJournalEntries() {
  if (!confirm("Delete all journal entries? This cannot be undone.")) return;
  saveJournalEntries([]);
  closeJournalEditor();
  renderJournalList();
  updateDashboardStats();
  showToast("Journal cleared.");
}

/* ─────────────────────────────────────────────────────
   9. CALENDAR
───────────────────────────────────────────────────── */

function renderCalendar(year, month) {
  const grid = document.getElementById("calendarGrid");
  if (!grid) return;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const label = document.getElementById("calMonthLabel");
  if (label) label.textContent = monthNames[month] + " " + year;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMon = new Date(year, month + 1, 0).getDate();
  const todayDate = new Date();
  const todayStr2 = todayStr();

  const moods = loadUserData("moods") || [];
  const entries = loadUserData("journal") || [];
  const sessions = loadUserData("chatSessions") || [];

  // Build maps for quick lookup
  const moodMap = {};
  const journalMap = {};
  const chatMap = {};
  moods.forEach(function (m) { const d = m.time.slice(0, 10); if (!moodMap[d]) moodMap[d] = m; });
  entries.forEach(function (e) { const d = e.date || e.createdAt.slice(0, 10); if (!journalMap[d]) journalMap[d] = e; });
  sessions.forEach(function (s) { const d = s.createdAt.slice(0, 10); chatMap[d] = (chatMap[d] || 0) + 1; });

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let html = dayNames.map(function (d) { return `<div class="cal-header-cell">${d}</div>`; }).join("");

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) html += `<div class="cal-day other-month"></div>`;

  for (let d = 1; d <= daysInMon; d++) {
    const dateKey = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    const isToday = dateKey === todayStr2;
    const isSel = dateKey === selectedCalDate;
    const hasMood = !!moodMap[dateKey];
    const hasJour = !!journalMap[dateKey];
    const hasChat = !!chatMap[dateKey];
    const moodEmoji = hasMood ? moodMap[dateKey].emoji : "";

    let dots = "";
    if (hasMood) dots += '<div class="cal-dot mood-dot"></div>';
    if (hasJour) dots += '<div class="cal-dot journal-dot"></div>';
    if (hasChat) dots += '<div class="cal-dot chat-dot"></div>';

    html += `<div class="cal-day${isToday ? " today" : ""}${isSel ? " selected" : ""}" onclick="selectCalendarDate('${dateKey}')">
      <div class="cal-day-num">${d}</div>
      <div class="cal-day-dots">${dots}</div>
      ${moodEmoji ? '<div class="cal-day-emoji">' + moodEmoji + '</div>' : ""}
    </div>`;
  }

  grid.innerHTML = html;

  // If a date is selected, refresh detail panel too
  if (selectedCalDate) renderCalDetail(selectedCalDate, moods, entries, sessions);
}

function changeCalMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar(calYear, calMonth);
}

function goToToday() {
  calYear = new Date().getFullYear();
  calMonth = new Date().getMonth();
  renderCalendar(calYear, calMonth);
  selectCalendarDate(todayStr());
}

function selectCalendarDate(dateKey) {
  selectedCalDate = dateKey;
  const addBtn = document.getElementById("calAddJournalBtn");
  if (addBtn) addBtn.style.display = "";
  renderCalendar(calYear, calMonth); // re-render to update selected state
}

function renderCalDetail(dateKey, moods, entries, sessions) {
  const dateLabel = document.getElementById("calDetailDate");
  const body = document.getElementById("calDetailBody");
  if (!dateLabel || !body) return;

  const d = new Date(dateKey + "T12:00:00");
  dateLabel.textContent = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const dayMood = moods.find(function (m) { return m.time.slice(0, 10) === dateKey; });
  const dayEntry = entries.find(function (e) { return (e.date || e.createdAt.slice(0, 10)) === dateKey; });
  const dayChatCount = (loadUserData("chatSessions") || []).filter(function (s) { return s.createdAt.slice(0, 10) === dateKey; }).length;

  let html = "";

  if (dayMood) {
    html += `<div class="cal-detail-section">
      <div class="cal-detail-section-title">Mood</div>
      <div class="cal-detail-mood">${dayMood.emoji} <strong>${escHtml(dayMood.name)}</strong>&nbsp;&nbsp;${dayMood.score}/5${dayMood.note ? '&nbsp;· ' + escHtml(dayMood.note) : ""}</div>
    </div>`;
  }

  if (dayEntry) {
    html += `<div class="cal-detail-section">
      <div class="cal-detail-section-title">Journal Entry</div>
      <div class="cal-detail-journal" onclick="openEntryFromCalendar('${dayEntry.id}')">
        <div class="cdj-title">${dayEntry.title ? escHtml(dayEntry.title) : "<em>Untitled</em>"}</div>
        <div class="cdj-preview">${escHtml(dayEntry.content?.slice(0, 80) || "")}</div>
      </div>
    </div>`;
  }

  if (dayChatCount > 0) {
    html += `<div class="cal-detail-section">
      <div class="cal-detail-section-title">Chat Sessions</div>
      <div class="cal-detail-chat">💬 ${dayChatCount} session${dayChatCount !== 1 ? "s" : ""} on this day</div>
    </div>`;
  }

  if (!html) html = '<div class="cal-detail-placeholder" style="padding:1.5rem 0"><div style="font-size:1.5rem;margin-bottom:0.4rem">🌱</div><p>Nothing logged on this day.<br>Click + Journal to add an entry.</p></div>';

  body.innerHTML = html;
}

function openEntryFromCalendar(entryId) {
  navigate("journal");
  setTimeout(function () { openJournalEditor(entryId); }, 200);
}

function addJournalForCalDate() {
  if (!selectedCalDate) return;
  navigate("journal");
  setTimeout(function () {
    openJournalEditor(null);
    const dateInput = document.getElementById("editorDate");
    if (dateInput) dateInput.value = selectedCalDate;
  }, 200);
}

/* ─────────────────────────────────────────────────────
   10. HISTORY
───────────────────────────────────────────────────── */

function switchHistTab(tab, btn) {
  currentHistTab = tab;
  document.querySelectorAll(".hist-tab").forEach(function (t) { t.classList.remove("active"); });
  document.querySelectorAll(".hist-tab-content").forEach(function (c) { c.classList.remove("active"); });
  if (btn) btn.classList.add("active");
  const content = document.getElementById("histTab" + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (content) content.classList.add("active");
}

function renderChatHistory() {
  const sessions = loadUserData("chatSessions") || [];
  const query = (document.getElementById("histChatSearch")?.value || "").toLowerCase();
  const container = document.getElementById("chatHistoryList");
  if (!container) return;

  let filtered = sessions;
  if (query) filtered = sessions.filter(function (s) { return s.title.toLowerCase().includes(query); });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state">' + (query ? "No sessions match your search." : "No chat sessions yet. Start a conversation! 💬") + '</div>';
    return;
  }

  container.innerHTML = filtered.map(function (s) {
    const firstAI = (s.messages || []).find(function (m) { return m.role === "ai"; });
    const preview = firstAI ? firstAI.text.slice(0, 80) : "No messages";
    return `<div class="chat-hist-item">
      <div class="chi-header">
        <div class="chi-title">${escHtml(s.title)}</div>
        <div class="chi-date">${s.timeStr || ""}</div>
      </div>
      <div class="chi-preview">${escHtml(preview)}</div>
      <div class="chi-meta">
        <span class="chi-badge mode-${s.mode}">${s.mode === "advice" ? "💡" : s.mode === "vent" ? "🌊" : "🔮"} ${s.mode || "advice"}</span>
        <span class="chi-count">${s.msgCount || 0} messages</span>
      </div>
      <div class="chi-actions">
        <button class="chi-view-btn" onclick="viewChatSession('${s.id}')">👁 View</button>
        <button class="chi-del-btn"  onclick="deleteChatSession('${s.id}')">🗑 Delete</button>
      </div>
    </div>`;
  }).join("");
}

function viewChatSession(id) {
  const sessions = loadUserData("chatSessions") || [];
  const session = sessions.find(function (s) { return s.id === id; });
  if (!session) return;

  const viewer = document.getElementById("sessionViewer");
  const title = document.getElementById("svTitle");
  const meta = document.getElementById("svMeta");
  const msgs = document.getElementById("svMessages");

  if (!viewer || !msgs) return;
  if (title) title.textContent = session.title;
  if (meta) meta.textContent = session.timeStr + " · " + (session.msgCount || 0) + " messages · " + (session.mode || "advice") + " mode";

  msgs.innerHTML = (session.messages || []).map(function (m) {
    return `<div class="sv-msg ${m.role === "user" ? "sv-user" : "sv-ai"}">
      <div class="sv-msg-bubble">${escHtml(m.text).replace(/\n/g, "<br/>")}</div>
      <div class="sv-msg-time">${m.time || ""}</div>
    </div>`;
  }).join("");

  viewer.classList.remove("hidden");
  viewer.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeSessionViewer() { document.getElementById("sessionViewer")?.classList.add("hidden"); }

function deleteChatSession(id) {
  if (!confirm("Delete this chat session?")) return;
  let sessions = loadUserData("chatSessions") || [];
  sessions = sessions.filter(function (s) { return s.id !== id; });
  saveUserData("chatSessions", sessions);
  renderChatHistory();
  updateDashboardStats();
  showToast("Session deleted.");
}

function clearAllChatHistory() {
  if (!confirm("Delete all chat history? This cannot be undone.")) return;
  saveUserData("chatSessions", []);
  renderChatHistory();
  closeSessionViewer();
  updateDashboardStats();
  showToast("Chat history cleared.");
}

function renderActivityLog() {
  const activity = loadUserData("activity") || [];
  const query = (document.getElementById("histActivitySearch")?.value || "").toLowerCase();
  const container = document.getElementById("activityLogList");
  if (!container) return;

  let filtered = activity.slice().reverse();
  if (query) filtered = filtered.filter(function (a) { return a.text.toLowerCase().includes(query); });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state">No activity logged yet. 🌱</div>';
    return;
  }

  const typeIcons = { chat: "💬", mood: "📊", journal: "📓", other: "✦" };
  container.innerHTML = filtered.map(function (a, i) {
    return `<div class="al-item">
      <div class="al-dot-col">
        <div class="al-dot type-${a.type || "other"}"></div>
        ${i < filtered.length - 1 ? '<div class="al-line"></div>' : ""}
      </div>
      <span class="al-text">${typeIcons[a.type] || "✦"} ${escHtml(a.text)}</span>
      <span class="al-time">${a.timeStr}</span>
    </div>`;
  }).join("");
}

function clearActivityLog() {
  if (!confirm("Clear the activity log?")) return;
  saveUserData("activity", []);
  renderActivityLog();
  renderDashActivity();
  showToast("Activity log cleared.");
}

/* ─────────────────────────────────────────────────────
   11. RESOURCES
───────────────────────────────────────────────────── */

function buildResourcesGrid() { renderResources(RESOURCES_DATA); }

function renderResources(data) {
  const grid = document.getElementById("resourcesGrid");
  if (!grid) return;
  if (data.length === 0) { grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1">No resources found. Try a different keyword.</div>'; return; }
  grid.innerHTML = data.map(function (r) {
    return `<div class="resource-card">
      <div class="rc-header">
        <div class="rc-icon" style="background:${r.iconBg};color:${r.iconColor}">${r.icon}</div>
        <div>
          <div class="rc-title">${escHtml(r.title)}</div>
          <span class="rc-tag" style="background:${r.tagBg};color:${r.tagColor}">${escHtml(r.tag)}</span>
        </div>
      </div>
      <div class="rc-body"><div class="rc-text">${escHtml(r.text)}</div></div>
      <div class="rc-footer">
        <span class="rc-meta">⏱ ${escHtml(r.meta)}</span>
        <button class="rc-action" onclick="resourceAction(${r.id})">${escHtml(r.action)} →</button>
      </div>
    </div>`;
  }).join("");
}

function setResourceFilter(filter, btn) {
  currentResourceFilter = filter;
  document.querySelectorAll(".filter-chip").forEach(function (c) { c.classList.remove("active"); });
  if (btn) btn.classList.add("active");
  applyResourceFilter();
}

function filterResources() { applyResourceFilter(); }

function applyResourceFilter() {
  const q = (document.getElementById("resourceSearch")?.value || "").toLowerCase();
  let d = RESOURCES_DATA;
  if (currentResourceFilter !== "all") d = d.filter(function (r) { return r.category === currentResourceFilter; });
  if (q) d = d.filter(function (r) { return r.title.toLowerCase().includes(q) || r.text.toLowerCase().includes(q) || r.tag.toLowerCase().includes(q); });
  renderResources(d);
}

function resourceAction(id) {
  const r = RESOURCES_DATA.find(function (x) { return x.id === id; });
  if (!r) return;
  navigate("chat");
  setTimeout(function () {
    const input = document.getElementById("chatInput");
    if (input) { input.value = "Can you guide me through the " + r.title + "?"; autoGrow(input); input.focus(); }
  }, 150);
}

/* ─────────────────────────────────────────────────────
   12. ABOUT (FAQ)
───────────────────────────────────────────────────── */

function buildFAQ() {
  const container = document.getElementById("faqList");
  if (!container) return;
  container.innerHTML = FAQ_DATA.map(function (item, i) {
    return `<div class="faq-item" id="faq-${i}">
      <div class="faq-q" onclick="toggleFAQ(${i})">
        <span>${escHtml(item.q)}</span>
        <span class="faq-chevron">▼</span>
      </div>
      <div class="faq-a">${escHtml(item.a)}</div>
    </div>`;
  }).join("");
}

function toggleFAQ(i) {
  const item = document.getElementById("faq-" + i);
  if (!item) return;
  item.classList.toggle("open");
}

/* ─────────────────────────────────────────────────────
   13. SETTINGS  (font fix included)
───────────────────────────────────────────────────── */

/**
 * FIX: Change font family — dynamically loads Google Font then applies it.
 * @param {string} fontName - e.g. "Nunito"
 * @param {HTMLElement} btn - the .font-option element clicked
 */
function changeFontFamily(fontName, btn) {
  // Load font if not already loaded
  if (!loadedFonts.has(fontName) && FONT_URLS[fontName]) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_URLS[fontName];
    document.head.appendChild(link);
    loadedFonts.add(fontName);
  }

  // Apply to CSS variable (used by --font everywhere)
  const fontStack = fontName === "Lora"
    ? `'Lora', serif`
    : `'${fontName}', sans-serif`;

  document.documentElement.style.setProperty("--font", fontStack);

  // Update preview box
  const preview = document.getElementById("fontPreviewBox");
  if (preview) preview.style.fontFamily = fontStack;

  // Update active state on picker options
  document.querySelectorAll(".font-option").forEach(function (el) {
    el.classList.toggle("active", el.dataset.font === fontName);
  });

  // Save setting
  state.settings.fontFamily = fontName;
  saveSettingsToStorage();
  showToast("Font changed to " + fontName);
}

/**
 * FIX: Change font size using range slider — applies immediately.
 * @param {string|number} size - pixel size e.g. "16"
 */
function changeFontSize(size) {
  const px = parseInt(size);
  document.documentElement.style.setProperty("--fs", px + "px");

  // Update the label
  const names = { 13: "Small", 14: "Small", 15: "Medium", 16: "Medium", 17: "Large", 18: "Large", 19: "X-Large", 20: "X-Large" };
  const labelEl = document.getElementById("fontSizeLabel");
  if (labelEl) labelEl.textContent = (names[px] || "Custom") + " (" + px + "px)";

  state.settings.fontSize = px;
  saveSettingsToStorage();
}

function toggleDarkMode() {
  state.settings.darkMode = !state.settings.darkMode;
  document.body.classList.toggle("dark", state.settings.darkMode);
  const cb = document.getElementById("darkModeToggle");
  if (cb) cb.checked = state.settings.darkMode;
  saveSettingsToStorage();
  showToast(state.settings.darkMode ? "🌙 Dark mode on" : "☀️ Light mode on");
}

function setAccent(btn) {
  const color = btn.dataset.color;
  state.settings.accentColor = color;
  document.documentElement.style.setProperty("--mint", color);
  document.documentElement.style.setProperty("--mint-d", darken(color, 12));
  document.querySelectorAll(".swatch").forEach(function (s) { s.classList.remove("active"); });
  btn.classList.add("active");
  saveSettingsToStorage();
  showToast("Accent color updated!");
}

function saveName() {
  const input = document.getElementById("displayNameInput");
  const name = (input?.value || "").trim();
  if (!name || name.length < 2) { showToast("Please enter a valid name."); return; }
  state.currentUser.name = name;
  // Update stored user
  const users = getAllUsers();
  const idx = users.findIndex(function (u) { return u.id === state.currentUser.id; });
  if (idx >= 0) { users[idx].name = name; saveAllUsers(users); }
  updateUserUI(name);
  showToast("Name saved! Hi, " + name.split(" ")[0] + " 👋");
}

function saveSetting(key, value) { state.settings[key] = value; saveSettingsToStorage(); }

function resetAllSettings() {
  if (!confirm("Reset all settings to defaults?")) return;
  state.settings = { darkMode: false, fontFamily: "DM Sans", fontSize: 16, accentColor: "#3CBFA0", defaultMode: "advice", showTyping: true, moodReminder: false, breathingReminder: false };
  applySettings();
  saveSettingsToStorage();
  showToast("Settings reset to defaults.");
}

/**
 * Apply all current settings to the DOM.
 * Called on startup and after reset.
 */
function applySettings() {
  const s = state.settings;

  // Dark mode
  document.body.classList.toggle("dark", s.darkMode);
  const dm = document.getElementById("darkModeToggle");
  if (dm) dm.checked = s.darkMode;

  // Font family
  changeFontFamily(s.fontFamily || "DM Sans", null);

  // Font size
  document.documentElement.style.setProperty("--fs", (s.fontSize || 16) + "px");
  const fsRange = document.getElementById("fontSizeRange");
  if (fsRange) { fsRange.value = s.fontSize || 16; changeFontSize(s.fontSize || 16); }

  // Accent color
  if (s.accentColor) {
    document.documentElement.style.setProperty("--mint", s.accentColor);
    document.documentElement.style.setProperty("--mint-d", darken(s.accentColor, 12));
    document.querySelectorAll(".swatch").forEach(function (sw) {
      sw.classList.toggle("active", sw.dataset.color === s.accentColor);
    });
  }

  // Font picker
  document.querySelectorAll(".font-option").forEach(function (el) {
    el.classList.toggle("active", el.dataset.font === (s.fontFamily || "DM Sans"));
  });

  // Default mode
  const mds = document.getElementById("defaultModeSelect");
  if (mds) mds.value = s.defaultMode || "advice";
  state.chatMode = s.defaultMode || "advice";

  // Typing
  const tip = document.getElementById("typingIndicatorToggle");
  if (tip) tip.checked = s.showTyping !== false;

  // Reminders
  const mr = document.getElementById("moodReminderToggle");
  if (mr) mr.checked = !!s.moodReminder;
  const br = document.getElementById("breathingReminderToggle");
  if (br) br.checked = !!s.breathingReminder;
}

/* ─────────────────────────────────────────────────────
   14. ACTIVITY LOGGING
───────────────────────────────────────────────────── */

const TYPE_ICONS = { chat: "💬", mood: "📊", journal: "📓", other: "✦" };

function logActivity(type, text) {
  if (!state.currentUser) return;
  const activity = loadUserData("activity") || [];
  activity.push({ type, text, icon: TYPE_ICONS[type] || "✦", time: new Date().toISOString(), timeStr: formatTime(new Date()) });
  // Keep last 200 entries
  saveUserData("activity", activity.slice(-200));
}

/* ─────────────────────────────────────────────────────
   15. STORAGE HELPERS
   All user data is namespaced by user ID so multiple
   accounts can coexist in the same browser.
───────────────────────────────────────────────────── */

// User accounts
function getAllUsers() { return JSON.parse(localStorage.getItem("mb_users") || "[]"); }
function saveAllUsers(users) { localStorage.setItem("mb_users", JSON.stringify(users)); }
function getUserById(id) { return getAllUsers().find(function (u) { return u.id === id; }) || null; }

// Session (which user is logged in)
function saveSession(session) { localStorage.setItem("mb_session", JSON.stringify(session)); }
function loadSession() { return JSON.parse(localStorage.getItem("mb_session") || "null"); }
function clearSession() { localStorage.removeItem("mb_session"); }

// Per-user data (namespaced)
function userKey(key) { return "mb_" + (state.currentUser?.id || "anon") + "_" + key; }
function loadUserData(key) { return JSON.parse(localStorage.getItem(userKey(key)) || "null"); }
function saveUserData(key, val) { localStorage.setItem(userKey(key), JSON.stringify(val)); }

// Settings (global, not per-user)
function saveSettingsToStorage() { localStorage.setItem("mb_settings", JSON.stringify(state.settings)); }
function loadSettingsFromStorage() {
  try {
    const s = JSON.parse(localStorage.getItem("mb_settings") || "null");
    if (s) state.settings = Object.assign({}, state.settings, s);
  } catch (e) { /* ignore */ }
}

/* ─────────────────────────────────────────────────────
   16. UTILITY HELPERS
───────────────────────────────────────────────────── */

// Sidebar
function openSidebar() { document.getElementById("sidebar")?.classList.add("open"); document.getElementById("sidebarOverlay")?.classList.add("visible"); }
function closeSidebar() { document.getElementById("sidebar")?.classList.remove("open"); document.getElementById("sidebarOverlay")?.classList.remove("visible"); }

// Toast
let toastTimer = null;
function showToast(msg, ms) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg; t.classList.add("visible");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove("visible"); }, ms || 2800);
}

// Time helpers
function formatTime(date) { return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function formatDateShort(date) { return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }); }
function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// Streak calculator
function calcStreak(moods) {
  if (!moods || moods.length === 0) return 0;
  const dates = new Set(moods.map(function (m) { return m.time.slice(0, 10); }));
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    if (!dates.has(key)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// DOM helpers
function setEl(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

// XSS protection
function escHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Email validation
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

// Simple hex color darkener
function darken(hex, pct) {
  try {
    hex = hex.replace("#", "");
    const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - Math.round(255 * pct / 100));
    const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - Math.round(255 * pct / 100));
    const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - Math.round(255 * pct / 100));
    return "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
  } catch (e) { return hex; }
}
