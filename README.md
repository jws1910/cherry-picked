# Cherry-Picked - Fashion Sale Tracker

Your personal fashion sale tracker that monitors sales across multiple brands.

## Features

- 🔍 **Real-time sale monitoring** across 32+ fashion brands
- 🎯 **Personalized brand tracking** - Save up to 5 favorite brands
- 🌍 **Multi-country support** - US, UK, and more
- 📱 **Responsive design** - Works on all devices
- 🔐 **Secure user authentication** with database storage
- ⚡ **Fast brand checking** with progress indicators

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cherry-picked
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start MongoDB**
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Start the backend server** (in a new terminal)
   ```bash
   node server.js
   ```

## MongoDB Setup & Troubleshooting

### Check if MongoDB is running:

```bash
# Check MongoDB status
brew services list | grep mongodb
# or
systemctl status mongod
```

### Check your database connection:

```bash
# Test MongoDB connection
mongo --eval "db.runCommand({ping: 1})"
# or
mongosh --eval "db.runCommand({ping: 1})"
```

### View your database:

```bash
# Connect to MongoDB shell
mongo cherry-picker
# or
mongosh cherry-picker

# View all users
db.users.find()

# Find specific user by email
db.users.findOne({email: "user@example.com"})

# Count total users
db.users.countDocuments()
```

### Using MongoDB Compass (GUI):

1. **Download MongoDB Compass** from [mongodb.com](https://www.mongodb.com/products/compass)
2. **Connect to**: `mongodb://localhost:27017`
3. **Select database**: `cherry-picker`
4. **View collection**: `users`

### Common Issues:

**"Collection has no data"**
- Check if the server is running: `node server.js`
- Verify MongoDB is running: `brew services list | grep mongodb`
- Check server logs for connection errors
- Ensure you're using the database authentication (not localStorage)

**"Connection refused"**
- Start MongoDB: `brew services start mongodb-community`
- Check MongoDB status: `systemctl status mongod`

**"User not saved to database"**
- Check server console for registration logs
- Verify API calls are reaching the server
- Check browser Network tab for failed requests

## Environment Variables

Create a `.env` file in the root directory:

```env
JWT_SECRET=your-secure-jwt-secret-key
MONGODB_URI=mongodb://localhost:27017/cherry-picker
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/check-email` - Check if email exists
- `GET /api/auth/profile` - Get user profile

### Sales
- `GET /api/check-all-sales` - Check all brands for sales

## Security Features

- 🔐 **Password hashing** with bcrypt
- 🎫 **JWT token authentication**
- 🛡️ **Protected API routes**
- ✅ **Input validation and sanitization**
- 🔒 **Secure error messages**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License 