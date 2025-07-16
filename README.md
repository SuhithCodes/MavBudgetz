# MavBudgetz - Personal Finance Tracker

<p align="center">
  <img src="https://img.shields.io/badge/MavBudgetz-Personal%20Finance%20Tracker-blue?style=for-the-badge&logo=react" alt="MavBudgetz Logo" />
</p>

<p align="center">
  A modern, full-stack personal finance management application built with Next.js 14, TypeScript, and Prisma.
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14.2.2-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.5.2-blue?style=flat-square&logo=typescript" alt="TypeScript" /></a>
  <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-5.15.1-2D3748?style=flat-square&logo=prisma" alt="Prisma" /></a>
  <a href="https://clerk.com/"><img src="https://img.shields.io/badge/Clerk-Authentication-6B46C1?style=flat-square" alt="Clerk" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind%20CSS-3.4.1-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" /></a>
</p>

<p align="center">
  <a href="#">Live Demo</a> • <a href="#">Report Bug</a> • <a href="#">Request Feature</a>
</p>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Implementation Notes](#implementation-notes)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🏷️ Tags

```text
personal-finance, nextjs, react, typescript, tailwindcss, prisma, mysql, fullstack, authentication, clerk, charts, analytics, budgeting, expense-tracker, income-tracker, dashboard, shadcn-ui, radix-ui, tanstack-query, recharts
```

---

## 🎯 About

MavBudgetz is a cutting-edge web-based platform designed to help users track their expenses and income effectively. As students often work with limited budgets and frequently find themselves overspending, MavBudgetz provides an intuitive solution to monitor financial activities and make informed decisions through visual analytics.

The application features a modern, responsive design with real-time data visualization, comprehensive transaction management, and robust user authentication. Built with performance and scalability in mind, it offers a seamless experience across all devices.

---

## ✨ Features

### 🔐 Authentication & Security
- **Clerk Authentication**: Secure user registration and login
- **Protected Routes**: Middleware-based route protection
- **User Session Management**: Persistent login sessions
- **Role-based Access**: User-specific data isolation

### 💰 Transaction Management
- **Income Tracking**: Add, edit, and categorize income sources
- **Expense Tracking**: Comprehensive expense logging with categories
- **Transaction History**: Complete audit trail of all financial activities
- **Bulk Operations**: Delete multiple transactions efficiently
- **Real-time Updates**: Instant data synchronization

### 📊 Analytics & Visualization
- **Interactive Charts**: Bar charts for income/expense trends
- **Period Analysis**: Monthly and yearly financial overviews
- **Category Statistics**: Visual breakdown by spending categories
- **Balance Tracking**: Real-time income, expense, and balance calculations
- **Date Range Filtering**: Customizable time period analysis

### 🏷️ Category Management
- **Custom Categories**: Create personalized income and expense categories
- **Icon Selection**: Emoji-based category icons for visual appeal
- **Category CRUD**: Full create, read, update, delete operations
- **Type-based Organization**: Separate income and expense categories

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Theme**: Automatic theme switching with system preference
- **Modern UI**: Shadcn/ui components for consistent design
- **Loading States**: Skeleton loaders for better UX
- **Toast Notifications**: Real-time feedback for user actions

### ⚙️ Settings & Customization
- **Currency Selection**: Support for multiple currencies
- **User Preferences**: Personalized application settings
- **Data Export**: CSV export functionality
- **Onboarding Wizard**: Guided setup for new users

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** – React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** – Type-safe JavaScript
- **[React 18](https://reactjs.org/)** – UI library
- **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** – Re-usable components
- **[Radix UI](https://www.radix-ui.com/)** – Headless UI primitives

### Backend & Database
- **[Prisma](https://www.prisma.io/)** – Type-safe database ORM
- **[MySQL](https://www.mysql.com/)** – Relational database
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** – Backend API

### Authentication & State Management
- **[Clerk](https://clerk.com/)** – Authentication and user management
- **[TanStack Query](https://tanstack.com/query)** – Server state management
- **[React Hook Form](https://react-hook-form.com/)** – Form handling

### Data Visualization & UI
- **[Recharts](https://recharts.org/)** – Chart library
- **[Lucide React](https://lucide.dev/)** – Icon library
- **[React CountUp](https://www.npmjs.com/package/react-countup)** – Animated counters
- **[Date-fns](https://date-fns.org/)** – Date manipulation

### Development Tools
- **[ESLint](https://eslint.org/)** – Code linting
- **[PostCSS](https://postcss.org/)** – CSS processing
- **[TypeScript](https://www.typescriptlang.org/)** – Type checking

---

## 🚀 Getting Started

### Prerequisites
- Node.js (>=18.0)
- MySQL Database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mavbudgetz.git
   cd mavbudgetz
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="mysql://username:password@localhost:3306/budgettracker"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Next.js
   NEXTAUTH_SECRET=your_nextauth_secret
   ```
4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # Seed database (optional)
   npx prisma db seed
   ```
5. **Start Development Server**
   ```bash
   npm run dev
   ```
6. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```text
MavBudgetz/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── sign-in/             # Sign-in pages
│   │   └── sign-up/             # Sign-up pages
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── _actions/            # Server actions
│   │   ├── _components/         # Dashboard components
│   │   ├── manage/              # Settings management
│   │   └── transactions/        # Transaction management
│   ├── api/                      # API routes
│   │   ├── categories/          # Category endpoints
│   │   ├── stats/               # Analytics endpoints
│   │   └── transactions/        # Transaction endpoints
│   └── wizard/                   # Onboarding wizard
├── components/                    # Shared components
│   ├── ui/                      # Shadcn/ui components
│   └── providers/               # Context providers
├── lib/                          # Utility libraries
│   ├── prisma.ts               # Database client
│   ├── utils.ts                # Helper functions
│   └── types.ts                # TypeScript types
├── prisma/                       # Database schema
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── tests/                        # Test files
└── public/                       # Static assets
```

---

## 🔧 Implementation Notes

### Database Schema
The application uses a well-structured MySQL database with the following key models:
- **UserSettings**: User preferences and currency settings
- **Category**: Custom categories for income and expenses
- **Transaction**: Financial transactions with metadata
- **MonthHistory**: Aggregated monthly financial data
- **YearHistory**: Aggregated yearly financial data

### Authentication Flow
- Clerk handles all authentication logic
- Protected routes are managed via middleware
- User sessions are automatically managed
- Role-based access control implemented

### State Management
- TanStack Query for server state management
- React Hook Form for form state
- Local state for UI interactions
- Optimistic updates for better UX

### Performance Optimizations
- Server-side rendering with Next.js
- Image optimization
- Code splitting and lazy loading
- Database query optimization with Prisma
- Caching strategies with TanStack Query

---

## 🧪 Testing

The project includes comprehensive testing with **77% test coverage**:

### Test Types
- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **System Tests**: End-to-end workflow testing
- **User Acceptance Tests**: Feature validation
- **Performance Testing**: Google Lighthouse metrics

### Test Files
- `test_login.py` – Authentication testing
- `test_signup.py` – Registration testing
- `test_add_expense.py` – Expense creation
- `test_add_income.py` – Income creation
- `test_delete_expense.py` – Expense deletion
- `test_delete_income.py` – Income deletion
- `test_validate_transactions_dashboard.py` – Dashboard validation

### Running Tests
```bash
# Run all tests
python -m pytest tests/

# Run specific test file
python -m pytest tests/test_login.py

# Generate coverage report
python -m pytest --cov=app tests/
```

---

## 🚀 Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables
Ensure all required environment variables are set in production:
```env
DATABASE_URL="mysql://username:password@host:port/database"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXTAUTH_SECRET="your-secret-key"
```

### Database Migration
```bash
# Run migrations in production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Deployment Platforms
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative deployment option
- **AWS**: For enterprise deployments
- **Docker**: Containerized deployment

### Performance Monitoring
- Google Lighthouse for performance metrics
- Error tracking and monitoring
- Database performance monitoring
- User analytics integration

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation as needed
- Follow the existing code style
- Ensure all tests pass before submitting

---

## 📊 Quality Metrics

- **Test Coverage**: 77%
- **Performance Score**: High (Lighthouse)
- **Accessibility**: WCAG 2.1 compliant
- **SEO**: Optimized for search engines
- **Security**: Regular security audits

---

## 🔮 Future Scope

### Planned Features
- **Multi-currency Support**: Real-time currency conversion
- **Receipt Scanning**: OCR technology for automatic transaction entry
- **Bill Reminders**: Automated payment notifications
- **Budget Goals**: Set and track financial goals
- **Export Options**: PDF reports and advanced data export
- **Mobile App**: React Native mobile application
- **API Integration**: Bank account synchronization
- **Advanced Analytics**: Machine learning insights

### Technical Improvements
- **GraphQL**: API modernization
- **Real-time Updates**: WebSocket integration
- **Offline Support**: Progressive Web App features
- **Microservices**: Architecture scaling
- **Cloud Functions**: Serverless backend

---

## 👥 Contributors

- **Suhith Ghanathay** – Full Stack Developer & Tester
- **Development Team** – Additional contributions

---

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

<p align="center">
  Made with ❤️ by the MavBudgetz Team  
  <a href="#">Report Bug</a> • <a href="#">Request Feature</a> • <a href="#">View Issues</a>
</p>
