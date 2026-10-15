# 🌙 Noor Gamified Islamic Education Platform By: Rustam Ali

> **Noor** is an interactive, web-based educational platform designed to make learning Arabic, daily Duas, and Islamic values engaging, fun, and rewarding for children aged 4–12.

---

## 📸 Overview & Features

**Noor (نور)** combines modern gamification mechanics—inspired by top learning apps—with structured Islamic education. It motivates young learners through visual quest paths, streak tracking, customizable avatars, and dynamic rewards.

### ✨ Key Features

- 🗺️ **Interactive Quest Map:** Sequential learning paths (Qaida, Wudu, Namaz) with real-time level progress, streaks, and gem trackers.
- 📚 **Interactive Lessons & Quizzes:** Flashcards, audio pronunciation helpers, drag-and-drop exercises, and multiple-choice quizzes.
- 🤲 **Daily Duas Hub:** Essential daily supplications (eating, sleeping, traveling) with clear Arabic script, English/Urdu transliteration, and audio recitation.
- 📖 **Islamic Stories Section:** Inspiring stories of the Prophets and moral lessons crafted for kids.
- 👤 **Dynamic Avatar Customization:** Customizable kid-friendly avatars with persistent `localStorage` session state across pages.
- 📜 **Automated Certificates:** Instant printable digital certificates earned upon course or milestone completion.
- 🌙 **Seasonal Challenges:** Special activity modules tailored for Ramzan and Rabi-ul-Awwal.
- 🏆 **User Profile & Leaderboard:** Real-time XP, Noor Gems, streak flame counters, and achievement badges.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** HTML5, CSS3 (Tailwind CSS & Custom Utility Styling)
- **Scripting:** Vanilla JavaScript (ES6+)
- **State Management:** `localStorage` for cross-page persistence (User sessions, avatar customization, XP/gems, streak counts)
- **Architecture:** Lightweight, responsive multi-page static web application (MPA)

---

## 📁 Project Structure

```text
├── index.html          # Landing / Home Page
├── map.html            # Interactive Quest Map
├── lesson.html         # Interactive Lesson & Quiz Module
├── duas.html           # Daily Duas Hub
├── stories.html        # Prophet Stories & Moral Tales
├── profile.html        # User Profile & Avatar Customization
├── login.html          # User Authentication / Session Entry
├── pricing.html        # Subscription Plans Overview
├── certificate.html    # Dynamic Certificate Generator
├── challenges.html     # Ramzan & Seasonal Activity Center
├── team.html           # Team & Leadership Page
├── css/                # Stylesheets (Tailwind CSS / Custom CSS)
├── js/                 # Application logic & localStorage controllers
└── assets/             # Icons, Avatars, &Audio files and Visuals
🚀 Getting Started
No complex build steps or node modules required! Since Noor uses a pure HTML/CSS/JS stack, you can run it locally in seconds:

Clone the repository:
git clone [https://github.com/your-username/noor-platform.git](https://github.com/your-username/noor-platform.git)
Navigate to the project directory:
cd noor-website
Open in Browser:
Open index.html to open it in your browser.
Alternatively, run it using the VS Code Live Server extension for hot reloading.
Credits & Attribution
Lead Developer: Rustam Ali
Development Partner/Company: KWK Creatives.com
License
This project is licensed under the open-source contribution license. Feel free to use, modify, and build upon it for educational purposes.
