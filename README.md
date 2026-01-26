# Personal Budget Management App

A modern, comprehensive budget management application built with Next.js 14, Ant Design, and Neon (PostgreSQL).

## Features

- **Dashboard**: Real-time overview of your financial health with interactive charts.
- **Income & Expense Tracking**: Easy logging and management of transactions.
- **Budgeting**: (Planned) Set limits for categories.
- **Analytics**: Detailed breakdown of spending habits, trend analysis, and reports.
- **Authentication**: Secure user accounts using NextAuth.js.
- **Responsive Design**: Works on Desktop, Tablet, and Mobile.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Component Library**: [Ant Design](https://ant.design/)
- **Charts**: [@ant-design/charts](https://charts.ant.design/)
- **Database**: [PostgreSQL (Neon)](https://neon.tech/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: Tailwind CSS & Ant Design Tokens

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database URL (Neon or local)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/budget-app.git
    cd budget-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up Environment Variables:
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgres://user:pass@host:port/db"
    NEXTAUTH_SECRET="your-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    ```

4.  Run Database Migrations:
    ```bash
    npx prisma migrate dev
    ```

5.  Run the Development Server:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable UI components (forms, charts, layout).
- `lib/`: Utility functions (DB connection, auth).
- `prisma/`: Database schema.

## Deployment

This app is ready to be deployed on [Vercel](https://vercel.com).

1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Add the Environment Variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.).
4.  Deploy!

## License

MIT
