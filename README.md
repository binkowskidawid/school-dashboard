# School Dashboard 🏫

A modern, full-stack school management system built with Next.js 15 and React 19. This application provides a
comprehensive platform for managing school operations, including student records, teacher assignments, class schedules,
and more.

## Features

- **Multi-Role Authentication**: Separate dashboards and functionalities for administrators, teachers, students, and
  parents
- **Real-Time Updates**: Instant updates for announcements, grades, and attendance
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Dark Mode Support**: Built-in theme switching capability
- **Role-Based Access Control**: Secure access management for different user types
- **Modern UI Components**: Built with shadcn/ui and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **State Management**: React Query
- **Testing**: Jest and React Testing Library
- **Type Safety**: TypeScript
- **API**: REST API with Next.js API routes

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 20 or higher
- pnpm (recommended) or npm
- PostgreSQL 15 or higher
- Git

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://your-repository-url/school-dashboard.git
   cd school-dashboard
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Copy the example environment file and update it with your values:
   ```bash
   cp .env.example .env
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   pnpm prisma generate

   # Run migrations
   pnpm db:migrate

   # Seed the database
   pnpm prisma db seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Build for production**
   ```bash
   pnpm build
   ```

## Default Login Credentials

You can use these credentials to test different user roles:

**Admin Account**:

- Username: admin1
- Password: admin1

## Project Structure

```
school-dashboard/
├── src/
│   ├── app/              # Next.js 15 app directory
│   ├── components/       # Reusable React components
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and helpers
│   ├── styles/          # Global styles and Tailwind config
│   └── types/           # TypeScript type definitions
├── prisma/              # Database schema and migrations
├── public/              # Static files
└── tests/               # Test files
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm lint` - Run ESLint
- `pnpm format:write` - Format code with Prettier
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Prisma Studio

## Docker Support

The project includes Docker support for easy deployment. To run using Docker:

```bash
# Build the Docker image
docker build -t school-dashboard .

# Run the container
docker run -p 3000:3000 school-dashboard
```

## Testing

Run the test suite using:

```bash
pnpm test
```

Or in watch mode:

```bash
pnpm test:watch
```
