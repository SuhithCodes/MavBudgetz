# MavBudget: Student Budgeting Made Simple

A modern, intuitive budgeting application designed specifically for students to manage their finances effectively.

![Tech Stack](https://skillicons.dev/icons?i=ts,nextjs,react,firebase,tailwind)

## 🌟 Features

### Core Features
- 📊 Real-time expense tracking and visualization
- 📱 Mobile-responsive design
- 📷 Receipt scanning with automatic data extraction
- 💰 Budget creation and management
- 🎯 Savings goals tracking
- 📈 Spending analytics and insights

### Student-Centric Features
- 📚 Category-based budget tracking (textbooks, meals, etc.)
- 🎓 Student-focused spending insights
- 📅 Monthly expense reports
- 📱 Push notifications for budget alerts
- 📧 Email notifications for important updates

## 🛠️ Tech Stack

- **Frontend**
  - Next.js 14 (App Router)
  - React
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
  - Recharts for data visualization

- **Backend & Services**
  - Firebase
    - Firestore (database)
    - Authentication
    - Cloud Functions
  - Groq AI (Llama 4 Scout) for receipt processing
  - PDFKit for report generation

- **Development Tools**
  - ESLint
  - Prettier
  - Husky for git hooks
  - date-fns for date manipulation

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mavbudget.git
   cd mavbudget
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📝 Implementation Notes

### Authentication Flow
- Uses Firebase Authentication with email/password and Google sign-in
- Protected routes with custom `ProtectedRoute` component
- Client-side auth state management with React Context

### Data Model
- **Expenses**: Tracks transactions with categories, amounts, and receipt data
- **Budgets**: Monthly budget limits per category
- **Savings Goals**: Target amounts with progress tracking
- **User Preferences**: Notification settings and display preferences

### State Management
- React Context for auth state
- Local state with useState for component-level data
- Firestore real-time listeners for data synchronization

### UI/UX Considerations
- Responsive design using Tailwind CSS
- Dark mode support
- Loading states and error handling
- Intuitive navigation with breadcrumbs
- Toast notifications for user feedback

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   - Fork this repository
   - Create a new project in Vercel
   - Connect your forked repository

2. **Configure Environment Variables**
   - Add all environment variables from `.env.local` to Vercel project settings

3. **Deploy Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy**
   - Vercel will automatically deploy your application
   - Each push to main will trigger a new deployment

### Post-Deployment

1. **Update Firebase Configuration**
   - Add your deployed domain to Firebase Authentication authorized domains
   - Configure Firebase Security Rules for production

2. **Monitor Performance**
   - Use Vercel Analytics to monitor performance
   - Check Firebase Console for backend metrics
   - Set up error tracking (e.g., Sentry)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@mavbudget.com or join our Discord channel.
