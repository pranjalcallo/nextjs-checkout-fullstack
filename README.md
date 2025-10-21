# Next.js E-commerce Checkout Case Study

This project implements a secure and performant e-commerce checkout experience using Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma with PostgreSQL, Zustand for state management, and JWT for authentication. It addresses all the core business and technical requirements of the case study.

## Table of Contents

1.  [Features](#features)
2.  [Technology Stack](#technology-stack)
3.  [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Database Setup](#database-setup)
    *   [Running the Application](#running-the-application)
4.  [Application Architecture](#application-architecture)
5.  [Testing](#testing)
6.  [Assumptions and Limitations](#assumptions-and-limitations)
7.  [Bonus Objectives Implemented](#bonus-objectives-implemented)
8.  [Evaluation Criteria](#evaluation-criteria)

## Features

*   **User Authentication:** Register and Login with JWT-based authentication.
*   **Product Listing:** View a list of mock products.
*   **Shopping Cart:** Add, update quantities, and remove items from a persistent shopping cart (synced with backend).
*   **Checkout Process:**
    *   View cart summary.
    *   Secure mock payment form (client-side and server-side validation).
    *   Graceful handling of loading, success, and error states.
    *   Mock payment API with simulated network delay and random success/failure.
*   **Data Security:** Sensitive card data not logged or stored. Passwords are hashed.
*   **Performance:** Client-side state management with Zustand, memoization of components (e.g., `ProductCard`, `CartItem`, `CartSummary`).
*   **Responsiveness & Accessibility:** Tailwind CSS for a responsive layout. Basic ARIA labels.
*   **Unit Testing:** Comprehensive unit tests for frontend components and backend API routes.

## Technology Stack

*   **Frontend:**
    *   **Next.js 15 (App Router):** React framework for SSR/CSR.
    *   **React:** UI library.
    *   **TypeScript:** Type safety.
    *   **Tailwind CSS:** Utility-first CSS framework.
    *   **Zustand:** Lightweight state management.
    *   **Axios:** HTTP client for API calls.
    *   **react-hot-toast:** For UI notifications.
*   **Backend (Next.js API Routes):**
    *   **Node.js:** Runtime environment.
    *   **Prisma:** ORM for database interaction.
    *   **PostgreSQL:** Relational database.
    *   **bcryptjs:** Password hashing.
    *   **jsonwebtoken:** JSON Web Tokens for authentication.
*   **Testing:**
    *   **Jest:** JavaScript testing framework.
    *   **React Testing Library:** For testing React components.
    *   **@testing-library/jest-dom:** Custom Jest matchers for DOM assertions.

## Getting Started

### Prerequisites

*   Node.js (v18.x or later)
*   npm (or yarn/pnpm)
*   PostgreSQL database instance

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/nextjs-ecommerce-checkout.git
    cd nextjs-ecommerce-checkout
    ```
    (Replace `YOUR_USERNAME` with your GitHub username if you create a repo)

2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    ```

### Database Setup

1.  **Create a `.env` file** in the root of the project based on `.env.example`:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db?schema=public"
    JWT_SECRET="YOUR_SUPER_SECRET_KEY_REPLACE_ME_WITH_A_LONG_RANDOM_STRING"
    ```
    *   Replace `user`, `password`, `localhost:5432`, and `ecommerce_db` with your PostgreSQL database credentials and name.
    *   Generate a strong random string for `JWT_SECRET` (e.g., using `openssl rand -base64 32`).

2.  **Run Prisma migrations:** This will create the necessary tables in your database.
    ```bash
    npx prisma migrate dev --name init_ecommerce_schema
    ```

3.  **Seed the database:** This will populate your `products` table with initial data.
    ```bash
    npm run seed
    # or yarn seed
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    # or yarn dev
    ```

2.  Open your browser and navigate to `http://localhost:3000`.

## Application Architecture

The application is built with Next.js App Router, using a `src` directory structure for better organization:

*   **`src/app/`**: Contains Next.js pages and API routes.
    *   `api/`: Backend API routes for authentication, products, cart, and checkout.
    *   `auth/`, `cart/`, `checkout/`, `/`: Frontend pages.
*   **`src/components/`**: Reusable React components, organized by feature (`auth`, `cart`, `checkout`) and general UI (`ui`).
*   **`src/hooks/`**: Custom React hooks for shared logic.
*   **`src/lib/`**: Utility functions (Prisma client, JWT helpers, general utilities).
*   **`src/stores/`**: Zustand stores for client-side state management (authentication, cart).
*   **`src/services/`**: Frontend API abstraction layer using Axios, providing functions to interact with the Next.js API routes.
*   **`src/types/`**: TypeScript declarations for various data structures.
*   **`src/middleware.ts`**: Next.js Middleware for potential server-side route protection (though client-side `AuthProvider` is primary here due to `localStorage` JWT storage).
*   **`prisma/`**: Prisma schema and seeding script.
*   **`tests/`**: Unit tests for components, stores, and API routes.

## Testing

The project includes unit tests using Jest and React Testing Library.

*   **Run all tests:**
    ```bash
    npm test
    # or yarn test
    ```
*   **Run tests in watch mode:**
    ```bash
    npm test:watch
    # or yarn test:watch
    ```
*   **Run tests with coverage report:**
    ```bash
    npm test:coverage
    # or yarn test:coverage
    ```

## Assumptions and Limitations

*   **Authentication Token Storage:** JWT is stored in `localStorage` for simplicity in this case study. In a production environment, `HttpOnly` cookies would be preferred for better security against XSS attacks.
*   **Payment Gateway:** The payment processing is entirely mocked on the backend. No actual payment gateway (e.g., Stripe, PayPal) integration is performed. Sensitive card data is validated but not stored/forwarded to a real gateway. In a real application, card details would be handled by a client-side SDK of a payment provider.
*   **Error Handling:** Basic error messages are provided. A more robust system might include error logging services and more user-friendly error display patterns.
*   **Product Details/Management:** No admin interface or detailed product pages are implemented, focusing solely on the checkout flow.
*   **Real-time Updates:** Cart updates are optimistic on the client but confirmed by re-fetching the cart from the backend. No WebSockets or server-sent events for real-time cart synchronization across multiple tabs/devices for the same user.
*   **Image Hosting:** Product images use placeholder URLs. In a production app, an image hosting service (e.g., Cloudinary, S3) would be used.
*   **Accessibility:** Basic accessibility considerations are applied (semantic HTML, ARIA labels for buttons). A full audit would be needed for WCAG compliance.

## Bonus Objectives Implemented

*   **Improved UI/UX:**
    *   Loading spinners for async operations.
    *   Confirmation/status screen after payment.
    *   `react-hot-toast` for user feedback.
*   **Retry Mechanism:** The `PaymentStatus` component includes a "Try Payment Again" button for failed payments.
*   **Accessibility Improvements:** ARIA labels on interactive elements (buttons).

## Evaluation Criteria

This project aims to demonstrate proficiency across the following areas:

*   **Code Quality:** Clean, modular, and maintainable TypeScript code.
*   **Next.js Proficiency:** Effective use of App Router, API routes, `Image` component.
*   **Security Awareness:** Client-side and server-side validation, password hashing, JWT for auth, no sensitive data logging.
*   **Performance Optimization:** Zustand for state management, `memo` for components, minimal re-renders.
*   **Testing Coverage:** Unit tests for critical frontend logic (forms, stores) and backend endpoints.
*   **Problem Solving:** Handling asynchronous states, error management, client-server data synchronization.
*   **UI/UX Quality:** Responsive design with Tailwind CSS, clear layout, user feedback.# nextjs-checkout-fullstack
