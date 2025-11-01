# Admin/Faculty Account Setup

## Creating a Faculty Account

### Method 1: Using the Faculty Login Page

1. Go to the website and click "Faculty Login"
2. Click "Need a faculty account? Sign up"
3. Enter your email and password
4. The account will be created with `role: 'faculty'` metadata
5. Check your email for verification link
6. After verification, you can login and access the dashboard

### Method 2: Using Supabase Dashboard (Recommended for First Admin)

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add User" or "Invite User"
4. Enter email and password
5. In "User Metadata" section, add:
   ```json
   {
     "role": "faculty"
   }
   ```
6. Save the user
7. The user can now login and access the faculty dashboard

### Method 3: Email Pattern Recognition

Faculty accounts are automatically recognized if the email contains:
- `faculty` (e.g., faculty@university.edu)
- `admin` (e.g., admin@university.edu)

## Faculty vs Student Access

### Faculty Can:
- ✅ View all feedback submissions
- ✅ See detailed analytics and charts
- ✅ Mark feedback as viewed
- ✅ Reply to non-anonymous feedback
- ✅ Chat with students in real-time
- ✅ Export feedback data
- ✅ View alerts for concerning feedback

### Students Can:
- ✅ Submit feedback (anonymous or with name)
- ✅ View their own feedback history
- ✅ Track if faculty has viewed their feedback
- ✅ Chat with faculty about their feedback
- ❌ Cannot see other students' feedback
- ❌ Cannot access the dashboard

## Testing the Setup

1. **Create a faculty account** using one of the methods above
2. **Login with the faculty account** - you should see the Dashboard
3. **Create a student account** from the student login page
4. **Login with the student account** - you should see the Feedback Form
5. **Submit feedback** as a student
6. **Login as faculty** - you should see the submitted feedback in the dashboard

## Security Notes

- Faculty accounts have elevated permissions in the database
- RLS (Row Level Security) policies enforce access control
- Students cannot access faculty features even if they try to manipulate the frontend
- All database queries are validated against user metadata and email patterns
