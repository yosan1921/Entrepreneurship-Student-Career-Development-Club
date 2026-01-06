# ESCDC Website - React + Node.js + MySQL (XAMPP)

A full-stack web application for the Entrepreneurship and Student Career Development Club (ESCDC) at Haramaya University.

## Features

- **Frontend (React)**
  - Modern React components with hooks
  - Responsive design
  - Interactive forms with validation
  - Real-time API integration
  - Dynamic event loading

- **Backend (Node.js/Express)**
  - RESTful API endpoints
  - MySQL database integration (XAMPP)
  - Member registration system
  - Event management
  - Contact form handling

## Project Structure

```
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database configuration
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── server.js           # Main server file
│   ├── database.sql        # SQL schema and sample data
│   └── package.json        # Backend dependencies
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── services/           # API service layer
│   └── App.js              # Main app component
├── public/                 # Static files
└── package.json            # Frontend dependencies
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- XAMPP (for MySQL database)

### Step 1: Setup XAMPP MySQL Database

1. **Start XAMPP:**
   - Open XAMPP Control Panel
   - Start **Apache** and **MySQL** services

2. **Create Database:**
   - Open phpMyAdmin: http://localhost/phpmyadmin
   - Click "New" to create a new database
   - Name it: `escdc`
   - Click "Create"

3. **Import Database Schema:**
   - Select the `escdc` database
   - Click "SQL" tab
   - Copy and paste the contents of `backend/database.sql`
   - Click "Go" to execute
   - You should see tables: `members`, `events`, `contacts` created with sample data

### Step 2: Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure `.env` file (already set for XAMPP defaults):
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=escdc
DB_USER=root
DB_PASSWORD=
JWT_SECRET=your_jwt_secret_key_here
```

4. (Optional) Verify tables were created:
   - In phpMyAdmin, click on `escdc` database
   - You should see 3 tables: `members`, `events`, `contacts`
   - Click on `events` table to see sample data

5. Start the backend server:
```bash
npm run dev
```

You should see:
```
Server running on port 5000
MySQL database connected successfully
Database: escdc
Make sure you have created the database and tables manually in XAMPP
```

### Step 3: Frontend Setup

1. Navigate to project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **phpMyAdmin:** http://localhost/phpmyadmin

## API Endpoints

### Members
- `POST /api/members/register` - Register new member
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID

### Events
- `GET /api/events` - Get all events
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contact submissions
- `PATCH /api/contact/:id/status` - Update contact status

### Health Check
- `GET /api/health` - Check API status

## Technologies Used

### Frontend
- React 18
- Axios for API calls
- CSS3 for styling

### Backend
- Node.js
- Express.js
- MySQL with Sequelize ORM
- CORS for cross-origin requests
- Body-parser for request parsing

### Database
- MySQL (via XAMPP)
- phpMyAdmin for database management

## Troubleshooting

### Backend won't connect to MySQL:
1. Make sure XAMPP MySQL is running (green in XAMPP Control Panel)
2. Check if MySQL is running on port 3306
3. Verify database name is `escdc` in phpMyAdmin
4. Check `.env` file has correct credentials (default: root with no password)

### Port already in use:
- Frontend (3000): Change in package.json or set PORT environment variable
- Backend (5000): Change PORT in backend/.env file
- MySQL (3306): Change in XAMPP config or backend/.env

### Database tables not created:
- Make sure you imported `backend/database.sql` in phpMyAdmin
- Check that the `escdc` database exists and contains 3 tables
- Verify XAMPP MySQL is running and accessible

## Development

To run both frontend and backend simultaneously:

1. **Terminal 1 - Start XAMPP MySQL** (via XAMPP Control Panel)

2. **Terminal 2 - Start backend:**
```bash
cd backend
npm run dev
```

3. **Terminal 3 - Start frontend:**
```bash
npm start
```

## Viewing Database

Access phpMyAdmin to view/manage your data:
- URL: http://localhost/phpmyadmin
- Database: `escdc`
- Tables: `members`, `events`, `contacts`

## Production Deployment

### Backend
- Deploy to services like Heroku, Railway, or DigitalOcean
- Use a production MySQL database (not XAMPP)
- Set environment variables for production

### Frontend
- Build: `npm run build`
- Deploy to Netlify, Vercel, or serve from Express

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request# Entrepreneurship-Student-Career-Development-Club
