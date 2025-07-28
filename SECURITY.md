# Security Documentation

## User Authentication & Database Security

### Database Storage
- **MongoDB**: User data is stored securely in MongoDB
- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 10
- **JWT Tokens**: Secure authentication using JSON Web Tokens with 7-day expiration

### User Data Storage
User details are stored in the MongoDB database with the following security measures:

1. **Email**: Stored in lowercase, unique constraint applied
2. **Password**: Hashed using bcrypt before storage
3. **Personal Info**: First name and last name stored as plain text (required for signup)
4. **Favorite Brands**: Array of brand keys (max 5 brands)
5. **Timestamps**: Automatic creation and update timestamps
6. **Last Login**: Tracked for security monitoring

### Authentication Flow

#### Login Process:
1. User enters email and password
2. System checks if email exists in database
3. If email doesn't exist: Shows signup prompt
4. If email exists: Verifies password hash
5. If password matches: Generates JWT token and logs user in
6. If password doesn't match: Shows "Invalid password" error

#### Signup Process:
1. User fills all required fields (First Name, Last Name, Email, Password)
2. System validates email format and password strength (min 6 characters)
3. System checks if email already exists
4. If email exists: Shows "Account already exists" error
5. If email is new: Creates account with hashed password
6. Generates JWT token and logs user in

### Security Features

#### Password Security:
- Minimum 6 characters required
- Passwords are hashed using bcrypt
- Salt rounds: 10 (secure balance of speed and security)

#### JWT Security:
- Secret key stored in environment variables
- 7-day token expiration
- Tokens are verified on protected routes

#### Database Security:
- MongoDB connection with proper error handling
- Input validation and sanitization
- Unique email constraints
- No sensitive data exposure in API responses

#### API Security:
- Protected routes require valid JWT tokens
- CORS enabled for cross-origin requests
- Error messages don't expose sensitive information
- Rate limiting can be added for production

### Environment Variables Required:
```
JWT_SECRET=your-secure-jwt-secret-key
MONGODB_URI=mongodb://localhost:27017/cherry-picker
```

### Production Security Recommendations:
1. Use HTTPS in production
2. Implement rate limiting
3. Add request logging
4. Use environment variables for secrets
5. Regular security audits
6. Database backup strategy
7. Monitor for suspicious activity 