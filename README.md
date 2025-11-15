# Lexical Leap 🌟

Lexical Leap is an intelligent vocabulary builder application designed to help users learn and master new words effectively. Built with Next.js and Firebase, it provides a seamless and interactive learning experience.

## ✨ Features

- **📚 Word List Management**: Create public or private word lists. Easily add, import (via CSV), and delete words.
- **🧠 Smart Learning Modes**:
  - **Flashcards**: Review words with a classic, effective flip-card interface.
  - **Quizzes**: Test your knowledge with multiple-choice quizzes generated from your lists.
- **🤖 AI-Powered Examples**: Instantly generate example sentences for any word using Genkit and Google's Gemini model.
- **📈 Progress Tracking**: Your quiz performance and mistakes are automatically tracked to help you identify and focus on challenging words.
- **🎯 Focused Review**: A dedicated "Review" page lists your weakest words (based on mistake count) so you know exactly what to study.
- **🔒 Authentication**: Secure user authentication and data management powered by Firebase Authentication and Firestore.
- **🐞 Debugging Tools**: A built-in auto-test feature to simulate user activity and populate learning data for quick testing.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **Generative AI**: [Genkit (Google)](https://firebase.google.com/docs/genkit) with the Gemini model
- **Deployment**: Firebase App Hosting
- **Language**: TypeScript

## 🚀 Getting Started

This project is a Next.js application bootstrapped with `create-next-app`.

### Prerequisites

- Node.js
- Firebase Project configured with Authentication (Email/Password) and Firestore.

### Running the Development Server

First, install the dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## 📁 Project Structure

```
.
├── src
│   ├── app/                # Next.js App Router pages (UI and routing)
│   │   ├── (app)/          # Authenticated routes (dashboard, lists, etc.)
│   │   ├── (auth)/         # Auth routes (login, signup)
│   │   └── layout.tsx      # Root layout
│   ├── ai/                 # Genkit flows for AI features
│   ├── components/         # Reusable React components
│   │   ├── dashboard/
│   │   ├── layout/
│   │   ├── learning/       # Flashcard and Quiz view components
│   │   └── word-lists/
│   ├── firebase/           # Firebase configuration and custom hooks
│   ├── hooks/              # Custom React hooks (e.g., useToast)
│   └── lib/                # Shared utilities, definitions, and Firestore helpers
├── docs/
│   └── backend.json        # Data schema definitions for Firestore
└── ...
```
