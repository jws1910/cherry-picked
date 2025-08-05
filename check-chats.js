const mongoose = require('mongoose');
const Chat = require('./models/Chat');
const User = require('./models/User');

async function checkDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/cherry-picker');
    console.log('Connected to MongoDB');
    
    // Check users
    const users = await User.find({}, 'email firstName lastName');
    console.log('\n📊 Users in database:', users.length);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName})`);
    });
    
    // Check chats
    const chats = await Chat.find();
    console.log('\n💬 Chats in database:', chats.length);
    chats.forEach((chat, i) => {
      console.log(`Chat ${i+1}:`, {
        id: chat._id,
        participants: chat.participants,
        messageCount: chat.messages.length,
        lastMessage: chat.lastMessage
      });
    });
    
    // Check if any users have friends
    const usersWithFriends = await User.find({ friends: { $exists: true, $ne: [] } });
    console.log('\n👥 Users with friends:', usersWithFriends.length);
    usersWithFriends.forEach(user => {
      console.log(`- ${user.email} has ${user.friends.length} friends`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

checkDatabase(); 