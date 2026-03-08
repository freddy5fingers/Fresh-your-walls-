# Fresh Your Walls Inc. - Basement Finishing Specialists

Fresh Your Walls Inc. is a premier basement finishing and remodeling contractor based in Hamilton and Mount Hope, Ontario. This application serves as a professional landing page and an AI-powered lead generation platform.

## 🚀 Features

- **Professional Landing Page**: A modern, responsive UI built with React and Tailwind CSS, showcasing services like Legal Secondary Suites, Custom Living Spaces, and Moisture Management.
- **AI Assistant (Gemini 3 Flash)**: A persistent chat assistant that provides expert advice on basement projects, permit requirements, and pricing.
- **Automated Lead Capture**: The AI assistant uses function calling to automatically save customer leads (name, contact info, project dimensions) into a database.
- **Admin Dashboard**: A built-in dashboard for the business owner to view and manage captured leads.
- **Moisture-Proof Focus**: Emphasizes the company's "Moisture First" approach using vapor barriers and specialized sub-flooring.
- **Brand Identity**: Custom branding using the official company colors (Deep Blue & Emerald Green) and professional typography.

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Lucide React (icons), Motion (animations).
- **Backend**: Node.js, Express.
- **Database**: SQLite (via `better-sqlite3`) for lead storage.
- **AI**: Google Gemini 3 Flash via `@google/genai` SDK.
- **Build Tool**: Vite.

## 📁 Project Structure

- `/src/App.tsx`: Main application component containing the UI and AI logic.
- `/server.ts`: Express server handling API routes and database operations.
- `/src/index.css`: Global styles and Tailwind theme configuration.
- `/metadata.json`: Application metadata and permissions.
- `leads.db`: SQLite database file (generated at runtime).

## 🚀 Getting Started

### Prerequisites

- Node.js installed.
- A Google Gemini API Key.

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file (or use the AI Studio secrets panel) and add:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 📊 Admin Access

To view captured leads:
1. Scroll to the bottom of the page (Footer).
2. Click on **"Admin Dashboard"** under the "Company" section.
3. A modal will appear displaying all leads stored in the database.

## 📞 Contact Information

- **Attention**: Hashim Sohrab
- **Phone**: (416) 915-5757
- **Email**: Freshurwalls@gmail.com
- **Address**: 168 Freedom Cres, Mount Hope, ON L0R 1W0

---
*Built with Google AI Studio Build*
