# Student Feedback Analysis System

A comprehensive web application that enables students to submit feedback and provides faculty with AI-powered analysis including sentiment detection, topic categorization, and actionable improvement suggestions.

## 🌟 Features

### Student Interface
- **Anonymous/Named Feedback Submission**: Students can choose to submit feedback anonymously or include their name
- **Real-time Character Counter**: Visual feedback on message length with 2000 character limit
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **User-friendly Interface**: Clean, intuitive design with helpful guidance

### Faculty Dashboard
- **Authentication System**: Secure login using Supabase Auth
- **Real-time Analytics**: 
  - Sentiment distribution charts
  - Top feedback topics
  - Activity trends over time
  - Key performance metrics
- **AI-Powered Analysis**: Automatic sentiment analysis and topic categorization using Google Gemini
- **Alert System**: Automated detection of concerning content (harassment, discrimination, etc.)
- **Export Functionality**: Download feedback data as CSV
- **Search and Filtering**: Advanced filtering by sentiment, topic, and date
- **Detailed View**: Full feedback details with AI suggestions

### Technical Features
- **Real-time Updates**: Live dashboard updates using Supabase subscriptions
- **AI Integration**: Google Gemini API for intelligent feedback analysis
- **Responsive Charts**: Interactive visualizations using Chart.js
- **Secure Database**: PostgreSQL with Row Level Security (RLS)
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI/NLP**: Google Gemini API
- **Charts**: Chart.js with React Chart.js 2
- **UI Components**: Custom components with Headless UI
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google AI Studio account (for Gemini API)

### 1. Clone and Install
```bash
git clone <repository-url>
cd student-feedback-app
npm install
```

### 2. Set Up Supabase
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and anon key
3. Click the "Supabase" button in Bolt (settings icon) to configure the connection
4. Run the database migration:
   - Go to your Supabase dashboard > SQL Editor
   - Copy and paste the contents of `supabase/migrations/create_feedback_schema.sql`
   - Execute the migration

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Get Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to your `.env` file

### 5. Create Faculty Account
1. Start the application: `npm run dev`
2. Switch to Faculty Login view
3. Sign up with an email and password
4. This account will have dashboard access

### 6. Start Development Server
```bash
npm run dev
```

## 📊 Database Schema

### Tables

#### `feedback`
- `id` - UUID primary key
- `message` - Text feedback (max 2000 chars)
- `sentiment` - 'positive', 'negative', or 'neutral'
- `topic` - Categorized topic (max 100 chars)
- `suggestions` - AI-generated improvement suggestions
- `is_anonymous` - Boolean flag for anonymity
- `student_name` - Optional student name
- `created_at` - Timestamp

#### `alerts`
- `id` - UUID primary key
- `message_id` - Foreign key to feedback
- `severity` - 'low', 'medium', or 'high'
- `alert_type` - Type of concerning content detected
- `created_at` - Timestamp

### Security
- Row Level Security (RLS) enabled on all tables
- Public access for feedback submission
- Authenticated access for faculty dashboard
- Optimized indexes for performance

## 🤖 AI Integration

The system uses Google Gemini Pro for:

### Sentiment Analysis
- Automatic detection of positive, negative, or neutral sentiment
- Contextual understanding of feedback content

### Topic Categorization
- Intelligent grouping of feedback into relevant topics
- Helps identify common themes and concerns

### Improvement Suggestions
- AI-generated actionable recommendations based on feedback
- Tailored suggestions for different sentiment types

### Alert Detection
- Automated scanning for concerning keywords
- Flags potential harassment, discrimination, or safety issues
- Severity classification for priority handling

## 📱 User Interface

### Student View
- Clean, minimalist feedback form
- Toggle between anonymous and named submission
- Real-time character counting
- Success/error notifications
- Mobile-responsive design

### Faculty Dashboard
- Comprehensive analytics overview
- Interactive charts and visualizations
- Real-time alert notifications
- Advanced filtering and search
- Detailed feedback inspection
- CSV export functionality

## 🔒 Security Features

- **Authentication**: Secure email/password authentication via Supabase
- **Authorization**: Role-based access control
- **Data Protection**: Row Level Security policies
- **Input Validation**: Client and server-side validation
- **CORS**: Properly configured cross-origin policies
- **SQL Injection Prevention**: Parameterized queries through Supabase

## 📈 Analytics Features

### Dashboard Metrics
- Total feedback count
- Sentiment distribution percentages
- Active alerts with severity levels
- Top feedback topics

### Visualizations
- Pie chart for sentiment distribution
- Horizontal bar chart for topic frequency
- Line chart for feedback volume trends
- Real-time updates via Supabase subscriptions

### Export Capabilities
- CSV export with filtering
- Date-based exports
- Comprehensive data including AI analysis

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── dashboard/      # Dashboard-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component
```

### Key Components
- **FeedbackForm**: Student feedback submission interface
- **Dashboard**: Faculty analytics and management interface
- **LoginForm**: Authentication interface
- **UI Components**: Reusable Button, Card, Input, etc.

### Custom Hooks
- **useAuth**: Authentication state management
- **useFeedback**: Data fetching and real-time updates

## 🚀 Deployment

The application is optimized for deployment on:
- **Bolt Hosting**: Built-in deployment support
- **Vercel**: Frontend deployment with Supabase backend
- **Netlify**: Static site deployment

### Build for Production
```bash
npm run build
```

## 📝 Usage Examples

### For Students
1. Visit the application
2. Write feedback in the text area
3. Choose anonymous or named submission
4. Submit feedback and receive confirmation

### For Faculty
1. Click "Faculty Login" 
2. Sign in with credentials
3. View analytics dashboard
4. Monitor alerts and feedback trends
5. Export data for further analysis
6. Review detailed feedback with AI insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Include error messages and environment details

---

Built with ❤️ using modern web technologies and AI-powered insights.