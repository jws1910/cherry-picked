// MongoDB initialization script
db = db.getSiblingDB('cherry-picker');

// Create users collection
db.createCollection('users');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });

print('Cherry-Picker database initialized successfully!'); 