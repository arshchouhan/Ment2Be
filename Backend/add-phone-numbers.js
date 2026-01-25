import mongoose from 'mongoose';
import User from './models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const addPhoneNumbers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://arshchouhan004_db_user:vY8GmuRFFOL0dnS1@myclusture.wckjr3r.mongodb.net/Uploom');
    
    console.log('Connected to MongoDB');
    
    // Find users without phone numbers
    const usersWithoutPhone = await User.find({ 
      $or: [
        { phoneNumber: { $exists: false } },
        { phoneNumber: { $eq: '' } },
        { phoneNumber: { $eq: null } }
      ]
    });
    
    console.log(`Found ${usersWithoutPhone.length} users without phone numbers`);
    
    // Add phone numbers to existing users
    const phoneUpdates = [
      { email: 'arshchouhan004@gmail.com', phoneNumber: '+919876543210' },
      { email: 'student@example.com', phoneNumber: '+919876543211' },
      { email: 'mentor@example.com', phoneNumber: '+919876543212' },
      { email: 'john@example.com', phoneNumber: '+919876543213' },
      { email: 'jane@example.com', phoneNumber: '+919876543214' }
    ];
    
    for (const update of phoneUpdates) {
      const user = await User.findOne({ email: update.email });
      if (user && !user.phoneNumber) {
        user.phoneNumber = update.phoneNumber;
        await user.save();
        console.log(`Added phone number ${update.phoneNumber} to ${update.email}`);
      }
    }
    
    // If no specific users found, add phone numbers to first few users
    if (usersWithoutPhone.length > 0) {
      for (let i = 0; i < Math.min(usersWithoutPhone.length, 5); i++) {
        const user = usersWithoutPhone[i];
        user.phoneNumber = `+9198765432${15 + i}`; // Generate unique phone numbers
        await user.save();
        console.log(`Added phone number ${user.phoneNumber} to ${user.email} (${user.role})`);
      }
    }
    
    // Display users with phone numbers
    const usersWithPhone = await User.find({ phoneNumber: { $exists: true, $ne: '' } });
    console.log('\nUsers with phone numbers:');
    usersWithPhone.forEach(user => {
      console.log(`${user.name} (${user.email}) - ${user.phoneNumber} - ${user.role}`);
    });
    
    console.log('\nPhone numbers added successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

addPhoneNumbers();
