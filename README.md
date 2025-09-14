# Lumero AI - Your Personal Career Counselor 🚀

Welcome to Lumero AI, a powerful web application designed to provide personalized career guidance. Built as a comprehensive full-stack project, Lumero leverages a modern tech stack to deliver an intelligent, multi-user chat experience where users can get advice tailored to their resumes and career goals.

This project was developed as a software engineer assignment for Oration AI.

Landing Page
![alt text](<Screenshot 2025-09-15 043528.png>)

Chat Page
![alt text](<Screenshot 2025-09-15 043512.png>)

---

## Live Demo

You can access the live, deployed version of the application here:

**[[Live Link](https://lumeroai.vercel.app/)]**

---

## Features

- **AI-Powered Chat:** Core of the application, providing intelligent and context-aware career advice.
- **User Authentication:** Secure sign-in/sign-up using Google (NextAuth.js), ensuring each user has a private and persistent chat history.
- **PDF Resume Upload:** Users can upload their resume (PDF), which the AI uses as context to provide highly personalized guidance.
- **Dynamic Session Management:**
  - Create, rename, and delete chat sessions.
  - Session history is saved and displayed in a sidebar for easy navigation.
  - The application intelligently loads the most recent chat session on startup.
- **Advanced UI/UX:**
  - Real-time AI typing indicators for a responsive feel.
  - Message status indicators (Sent/Delivered) for user messages.
  - Optimistic UI updates for a snappy, instantaneous user experience.
- **Fully Responsive Design:** A clean, modern interface that works seamlessly on both desktop and mobile devices, featuring a collapsible sidebar.

---

## 🔧 Tech Stack

This project is built with a modern, type-safe, full-stack technology stack.

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [ShadCN/UI](https://ui.shadcn.com/)
- **API Layer:** [tRPC](https://trpc.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (hosted on [Neon](https://neon.tech/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js (Auth.js v5)](https://authjs.dev/)
- **Data Fetching/State:** [TanStack Query](https://tanstack.com/query/latest) (via tRPC)
- **PDF Parsing:** [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- **AI Integration:** [OpenRouter](https://openrouter.ai/)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or another package manager
- [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/umarsayed12/Lumero.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd lumero
    ```
3.  **Install dependencies:**
    ```sh
    npm install
    ```

### Environment Variables

To run this project, you will need to set up your environment variables.

1.  Create a file named `.env` in the root of your project.
2.  Use the template below and fill in your own keys.

```env
# Database URL from your PostgreSQL provider (e.g., Neon)
DATABASE_URL="postgresql://user:password@host:port/dbname"

# NextAuth.js Google Provider Credentials
# Get these from the Google Cloud Console
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

# A secret key for NextAuth.js to sign tokens
# Generate a random string: `openssl rand -base64 32`
AUTH_SECRET="YOUR_AUTH_SECRET"

# NextAuth.js URL for production
# Set this to your localhost for development
AUTH_NEXTAUTH_URL="http://localhost:3000"

# API Key from OpenRouter.ai to access the LLM
OPENROUTER_API_KEY="YOUR_OPENROUTER_API_KEY"

```

### Database Setup

This project uses Prisma to manage the database schema.

1.  Make sure your `DATABASE_URL` in the `.env` file is set up correctly.
2.  Run the Prisma migration to create all the necessary tables in your database:
    ```sh
    npx prisma migrate dev
    ```

### Running the Development Server

Once the installation and setup are complete, you can start the development server.

```sh
npm run dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

---

## ☁️ Deployment

This application is configured for easy deployment on **Vercel**.

1.  Push your code to a GitHub repository.
2.  Import the repository on Vercel.
3.  Set up the same environment variables from your `.env` file in the Vercel project settings.
4.  Deploy\! Vercel will automatically handle the build and deployment process.
