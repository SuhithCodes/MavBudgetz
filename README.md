# MavBudgetz - Personal Finance Tracker

## Description

MavBudgetz is a cutting-edge web-based platform designed to help users track their expenses and income effectively. As students often work with limited budgets and frequently find themselves overspending, MavBudgetz provides an intuitive solution to monitor financial activities and make informed decisions through visual analytics.

## Features

- User Registration and Authentication
- Expense Tracking with custom categories
- Income Management
- Transaction History
- Data Visualization (charts and graphs)
- Responsive Design
- Dark/Light Theme Support

## Technical Stack

- **Frontend**: React, TypeScript, HTML, CSS
- **Backend**: Node.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: Clerk
- **Development Tools**: Visual Studio Code, Jira

## Requirements

- Node.js (>=18.0)
- MySQL
- Prisma

## Setup Instructions

1. Install dependencies:

```bash
npm install @clerk/nextjs
npm install prisma typescript ts-node @types/node --save-dev
npm install
```

2. Set up the database:

```bash
npx prisma migrate dev
```

3. Build the application:

```bash
npm run build
```

4. Start the application:

```bash
npm run start
```

## Project Structure

- `/app` - Main application code
- `/components` - Reusable React components
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/styles` - CSS and styling files

## Testing

The project includes comprehensive testing:

- Unit Tests
- Integration Tests
- System Tests
- User Acceptance Tests
- Performance Testing using Google Lighthouse

## Quality Metrics

- Test Coverage: 77%
- Performance Score: High
- Accessibility: Implemented following best practices
- SEO: Optimized

## Maintenance

Regular maintenance includes:

- Bug fixes and error resolution
- Security updates
- Performance optimization
- Feature enhancements
- Regular backups and monitoring

## Future Scope

- Integration with additional sign-up options (Google, Facebook, Apple, GitHub)
- Group budget management
- Receipt scanning using OCR technology
- Bill reminders and notifications
- Mobile application development

## Contributors

- Suhith Ghanathay - Full Stack, Tester
- Team members' contributions

## License

This project is proprietary and confidential.

For more information or support, please contact the development team.
