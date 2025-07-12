# Cleaning Service Management System

A full-stack web application for managing cleaning service bookings with user authentication and CRUD operations.

## Features

### User Features
- **User Registration & Login** - Secure authentication with JWT
- **Book Cleaning Services** - Create bookings with customer details, address, date/time, and service type
- **View Bookings** - Dashboard showing all user bookings with service details
- **Edit Bookings** - Update existing bookings
- **Cancel Bookings** - Delete bookings with confirmation
- **Service Selection** - Choose from multiple cleaning services (Deep Cleaning, Carpet Cleaning, etc.)

### Technical Features
- **RESTful API** - Complete CRUD operations for bookings
- **Database** - SQLite database with proper relationships
- **Authentication** - JWT-based authentication
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS
- **Form Validation** - Client and server-side validation
- **Error Handling** - Comprehensive error handling and user feedback

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Local Storage** - Token persistence

## Project Structure

```
cleaning-service-management/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── cleaning_service.db (auto-generated)
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. **Create backend directory and initialize:**
```bash
mkdir cleaning-service-backend
cd cleaning-service-backend
npm init -y
```

2. **Install dependencies:**
```bash
npm install express cors bcrypt jsonwebtoken sqlite3 dotenv
npm install -D nodemon
```

3. **Create server.js file** (copy from the backend artifact above)

4. **Update package.json scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

5. **Start the backend server:**
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Create React app:**
```bash
npx create-react-app cleaning-service-frontend
cd cleaning-service-frontend
```

2. **Install additional dependencies:**
```bash
npm install lucide-react
npm install -D tailwindcss autoprefixer postcss
```

3. **Configure Tailwind CSS:**
```bash
npx tailwindcss init -p
```

4. **Update tailwind.config.js:**
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

5. **Update src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

6. **Replace src/App.js** with the frontend code from the artifact above

7. **Start the frontend:**
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Deploy to Vercel
The frontend will run on `https://cleaning-service-management.vercel.app/`

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Services
- `GET /api/services` - Get all available services

### Bookings (Protected Routes)
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Services Table
```sql
CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  address TEXT NOT NULL,
  date_time DATETIME NOT NULL,
  service_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## Default Data

The application comes with:
- **Admin User**: Username: `admin`, Password: `admin123`
- **Pre-loaded Services**:
  - Deep Cleaning - $150.00
  - Carpet Cleaning - $80.00
  - Window Cleaning - $60.00
  - Kitchen Cleaning - $100.00
  - Bathroom Cleaning - $70.00

## Usage

1. **Register/Login**: Create a new account or use the demo credentials
2. **View Dashboard**: See your booking statistics and existing bookings
3. **Create Booking**: Click "New Booking" to add a service booking
4. **Manage Bookings**: Edit or delete existing bookings from the dashboard
5. **Form Validation**: All forms include validation for required fields

## Features Implemented

✅ User registration and authentication  
✅ JWT-based security  
✅ CRUD operations for bookings  
✅ Service selection dropdown  
✅ Form validation (client and server-side)  
✅ Responsive design  
✅ Error handling  
✅ Database relationships  
✅ RESTful API design  
✅ Clean, modern UI  

## Deployment

### Backend Deployment (Railway/Heroku)
1. Create a new project on Railway or Heroku
2. Connect your GitHub repository
3. Set environment variables:
   - `JWT_SECRET=your-secret-key`
   - `PORT=5000`
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `build` folder to Vercel or Netlify
3. Update API base URL in the frontend code to point to your deployed backend

## Environment Variables

Create a `.env` file in the backend directory:
```
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on the GitHub repository.

