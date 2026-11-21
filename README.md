<div align="center">

# 🐼 Panda SAT Vocab
### High-Retention Digital SAT 1600 Vocabulary Mastery Engine

[![Live Demo](https://img.shields.io/badge/Demo-panda--sat--vocab.vercel.app-00FFCC?style=for-the-badge&logo=vercel)](https://panda-sat-vocab.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Oxlint](https://img.shields.io/badge/Linter-Oxlint-F59E0B?style=for-the-badge)](https://oxc.rs/)

**Panda SAT Vocab** is an interactive, scientifically grounded active-recall learning application engineered to help high school students master high-frequency Digital SAT Reading & Writing vocabulary.

[🚀 Explore Live Application](https://panda-sat-vocab.vercel.app)

</div>

---

## 🎯 Pedagogical Methodology

Digital SAT vocabulary tests words in nuanced, contextual reading passages rather than isolated dictionary definitions. Panda SAT Vocab incorporates multiple cognitive recall paradigms:

1. **Contextual Flashcards**: Spaced repetition flip cards with definitions, parts of speech, collocations, and authentic exam-style sentence usage.
2. **Quiz & Active Recall Drills**: Four-choice diagnostic multiple choice challenges that test definition recall under timed pressure.
3. **Interactive Match Game**: Dynamic tile matching targeting cognitive association speed and working memory.
4. **Spelling & Dictation Mode**: Audio-assisted spelling input to reinforce word morphology and phonetic retention using the Web Speech API.
5. **Oral Exam Diagnostic Reporting**: Automated progress tracking with performance metrics and mastery breakdown.

---

## ⚡ Core Technical Features

- **⚡ Blazing Fast Architecture**: Built with **Vite 6** and **React 18** for instant rendering and sub-50ms interaction latency.
- **🎨 Tailwind CSS v4 Styling**: Modern dark/light adaptive user interface with micro-interactions and smooth transitions.
- **🔊 Multi-Sensory Audio**: Native speech synthesis (`speech.ts`) and interactive sound effects (`audio.ts`) providing accurate pronunciation.
- **💾 Offline-First Local Storage**: Progress, streaks, and mastered word lists persist locally across sessions via zero-dependency storage adapters (`storage.ts`).
- **🛡️ Strict Type Safety & Oxlint**: Full TypeScript end-to-end typing with Oxlint for static analysis and sub-second lint passes.

---

## 📂 Source Code Structure

```
src/
├── assets/             # Vector icons, SVG badges, and visual branding
├── components/
│   ├── Flashcards.tsx      # Spaced-repetition flip card system
│   ├── QuizLearn.tsx       # Multiple-choice diagnostic exam drills
│   ├── MatchGame.tsx       # Rapid cognitive association matching grid
│   ├── SpellingMode.tsx    # Audio-prompted spelling challenge
│   ├── OralExamReport.tsx  # Analytics and diagnostic mastery reporting
│   ├── WordList.tsx        # Searchable and filterable vocabulary catalog
│   └── Navbar.tsx          # Responsive navigation & theme toggling
├── data/
│   ├── vocabulary.ts       # Structured Digital SAT vocabulary types
│   └── vocabulary.json     # Curated high-yield lexical dataset
├── utils/
│   ├── audio.ts            # Web Audio sound effects & feedback tones
│   ├── speech.ts           # Web Speech API pronunciation engine
│   ├── storage.ts          # LocalStorage persistence & telemetry
│   └── theme.ts            # Dynamic system / dark mode management
├── types.ts            # Strict domain model type definitions
├── App.tsx             # Root application orchestrator
└── main.tsx            # Vite DOM mount point
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- npm, pnpm, or yarn

### 1. Clone Repository
```bash
git clone https://github.com/MusayevDoniyor/panda-sat-vocab.git
cd panda-sat-vocab
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
npm run build
```

### 5. Run Oxlint
```bash
npm run lint
```

---

## 👤 Author & Maintainer

**Doniyor Musayev**
- **GitHub:** [@MusayevDoniyor](https://github.com/MusayevDoniyor)
- **Portfolio:** [doniyorweb.uz](https://doniyorweb.uz)
- **LinkedIn:** [linkedin.com/in/doniyor-musayev](https://www.linkedin.com/in/doniyor-musayev/)
- **Telegram:** [@Musayev_Doniyor](https://t.me/Musayev_Doniyor)

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
