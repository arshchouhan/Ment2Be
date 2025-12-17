import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import Review from '../models/review.model.js';

dotenv.config();

const REVIEW_COMMENTS = [
  "Excellent mentor! Very knowledgeable and patient.",
  "Great session, learned a lot. Highly recommended!",
  "Amazing guidance and support. Thank you!",
  "Professional and helpful. Will book again.",
  "Outstanding expertise. Very satisfied.",
  "Fantastic mentor. Exceeded expectations.",
  "Great communication and clear explanations.",
  "Highly skilled and very approachable.",
  "Wonderful experience. Best mentor ever!",
  "Exceptional teaching skills. Highly recommended."
];

const addRandomRatings = async () => {
  try {
    console.log('🔄 [ADD RATINGS] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ [ADD RATINGS] Connected to MongoDB');

    // Find all mentors (users with role 'mentor')
    const mentors = await User.find({ role: 'mentor' });
    console.log(`📊 [ADD RATINGS] Found ${mentors.length} mentors`);

    let ratingsAdded = 0;

    for (const mentor of mentors) {
      // Check if mentor already has reviews
      const existingReviews = await Review.countDocuments({ mentor: mentor._id });
      
      if (existingReviews === 0) {
        // Generate 3-8 random reviews for this mentor
        const reviewCount = Math.floor(Math.random() * 6) + 3;
        
        for (let i = 0; i < reviewCount; i++) {
          const rating = Math.floor(Math.random() * 2) + 4; // Random rating between 4-5
          const comment = REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)];
          
          const review = new Review({
            mentor: mentor._id,
            student: mentor._id, // Use mentor as student for demo purposes
            rating: rating,
            review: comment,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
          });

          await review.save();
          ratingsAdded++;
          console.log(`⭐ [ADD RATINGS] Added review for ${mentor.name}: ${rating} stars`);
        }
      } else {
        console.log(`⏭️ [ADD RATINGS] ${mentor.name} already has ${existingReviews} reviews, skipping`);
      }
    }

    console.log(`\n✅ [ADD RATINGS] Successfully added ${ratingsAdded} random reviews`);
    console.log('🎉 [ADD RATINGS] Mentors now have ratings!');

    await mongoose.connection.close();
    console.log('✅ [ADD RATINGS] Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ [ADD RATINGS] Error:', error.message);
    process.exit(1);
  }
};

addRandomRatings();
