
# ProgressBuddy - Coding Progress Tracker

## Project Overview

ProgressBuddy is a comprehensive web application designed to help developers track and visualize their coding journey across multiple platforms. The application serves as a centralized dashboard that aggregates progress data from various coding platforms like LeetCode and GeeksforGeeks, providing users with insightful analytics and personalized recommendations to improve their skills.

## Key Features

### 1. Unified Dashboard
- **Cross-Platform Tracking**: Connects to multiple coding platforms (LeetCode, GeeksforGeeks) to track progress in one place
- **Visual Analytics**: Displays comprehensive charts and statistics about coding activities
- **Progress Monitoring**: Tracks active days, streaks, and overall growth

### 2. AI-Powered Recommendations
- **Topic Suggestions**: Uses OpenAI to generate personalized topic recommendations based on current progress
- **Learning Path Guidance**: Suggests next steps for skill improvement based on performance analytics
- **Customized Problem Recommendations**: Recommends specific problems to practice based on skill gaps

### 3. User Profile Management
- **Platform Connections**: Allows users to connect and manage their coding platform accounts
- **Customizable Profiles**: Lets users create and customize their developer profiles
- **Social Sharing**: Enables sharing of progress and achievements to social media platforms

## Technical Architecture

### Frontend
- **Framework**: React with TypeScript for type safety
- **UI Components**: Built with shadcn/ui component library
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API and React Query for data fetching
- **Routing**: React Router for navigation
- **Charts**: Recharts for data visualization

### Backend
- **Platform**: Supabase for backend services
- **Authentication**: Supabase Auth for user authentication
- **Database**: PostgreSQL (via Supabase)
- **Edge Functions**: Serverless functions for API integration and AI processing
- **AI Integration**: OpenAI API for generating personalized recommendations

### API Integrations
- **LeetCode API**: Fetches user statistics and problem-solving data
- **GeeksforGeeks API**: Retrieves user progress and problem-solving patterns
- **OpenAI API**: Generates personalized topic suggestions

## Getting Started

### Prerequisites
- Node.js and npm installed
- Supabase account
- OpenAI API key

### Installation
1. Clone the repository
2. Run `npm install` to install dependencies
3. Set up environment variables for Supabase and OpenAI
4. Run `npm run dev` to start the development server

### Environment Variables
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `OPENAI_API_KEY`: Your OpenAI API key

## User Flow

1. **Sign Up/Sign In**: Users create an account or sign in to existing account
2. **Connect Platforms**: Users connect their LeetCode and GeeksforGeeks accounts
3. **Dashboard View**: Users see unified statistics and visualizations of their coding progress
4. **Generate Recommendations**: Users get AI-powered topic suggestions based on their performance
5. **Manage Profile**: Users can update their profile information and platform connections
6. **Track Progress**: Users monitor their improvement over time with detailed analytics

## Future Enhancements

- Integration with additional coding platforms (HackerRank, CodeChef, etc.)
- Collaborative features for team learning
- Interview preparation tracking
- Code review integration
- Custom learning paths
- Mobile application support

## Project Structure

```
progressbuddy/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/             # UI components from shadcn/ui
│   │   ├── DashboardLayout # Layout component for dashboard
│   │   ├── Navbar          # Navigation bar component
│   │   ├── Sidebar         # Side navigation component
│   │   ├── TopicSuggestion # AI-powered topic suggestion component
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext     # Authentication context
│   ├── integrations/
│   │   └── supabase/       # Supabase client and types
│   ├── pages/
│   │   ├── Dashboard       # Main dashboard page
│   │   ├── Home            # Landing page
│   │   ├── Platforms       # Platform management page
│   │   ├── Profile         # User profile page
│   │   └── ...
│   └── App.tsx             # Main application component
├── supabase/
│   └── functions/          # Supabase Edge Functions
└── package.json
```

## Security Considerations

- User authentication is handled securely through Supabase Auth
- API keys are stored as environment variables and never exposed to clients
- Edge Functions implement proper authorization checks
- Database access is controlled through Row Level Security policies

## Contributing

We welcome contributions to ProgressBuddy! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License.
