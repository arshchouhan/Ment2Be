import React, { useState, useEffect } from 'react';
import studentImg1 from '../../assets/handsome-young-indian-student-man-holding-notebooks-while-standing-street.jpg';
import studentImg2 from '../../assets/smiling-happy-indian-student-with-backpack-pointing-his-finger-wall.jpg';
import studentImg3 from '../../assets/smiling-student-with-laptop.jpg';
import studentImg4 from '../../assets/front-view-smiley-man-holding-book.jpg';
import studentImg5 from '../../assets/smiling-young-caucasian-woman-holds-pen-notebook.jpg';

const ProfileCarousel = () => {
  const [currentProfile, setCurrentProfile] = useState(0);

  const studentImages = [
    studentImg1,
    studentImg2,
    studentImg3,
    studentImg4,
    studentImg5,
  ];

  const profiles = [
    {
      name: "Rajesh Kumar",
      role: "Learning Digital Marketing",
      photo: studentImages[0],
      review: "My mentor helped me master SEO and social media marketing. I'm now running successful campaigns!",
      rating: 5
    },
    {
      name: "Arjun Patel",
      role: "Preparing for Business School",
      photo: studentImages[1],
      review: "The guidance I received was invaluable. My mentor helped me ace my entrance exams!",
      rating: 5
    },
    {
      name: "Rohan Desai",
      role: "Building Design Portfolio",
      photo: studentImages[2],
      review: "Amazing platform! My mentor helped me create an impressive design portfolio. Got my first design job!",
      rating: 5
    },
    {
      name: "Karan Mehta",
      role: "Learning Content Writing",
      photo: studentImages[3],
      review: "The mentorship helped me improve my writing skills. Now I'm freelancing as a content writer!",
      rating: 5
    },
    {
      name: "Divya Nair",
      role: "Mastering Communication Skills",
      photo: studentImages[4],
      review: "I cannot recommend Ment2Be enough! My mentor's guidance transformed my confidence and presentation skills.",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProfile((prev) => (prev + 1) % profiles.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [profiles.length]);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <div className="text-center px-8 max-w-lg">
        {/* Profile Photo */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full mx-auto border-4 border-white/20 shadow-2xl overflow-hidden bg-gray-700">
              <img
                src={profiles[currentProfile].photo}
                alt={profiles[currentProfile].name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <h3 className="text-2xl font-bold text-white mb-1">{profiles[currentProfile].name}</h3>
        <p className="text-gray-400 mb-6">{profiles[currentProfile].role}</p>

        {/* Rating Stars */}
        <div className="flex justify-center mb-4">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${i < profiles[currentProfile].rating ? 'text-yellow-400' : 'text-gray-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Review Text */}
        <p className="text-gray-300 text-lg italic leading-relaxed mb-8">
          "{profiles[currentProfile].review}"
        </p>

        {/* Carousel Indicators */}
        <div className="flex justify-center space-x-2">
          {profiles.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentProfile(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentProfile ? 'bg-white w-8' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileCarousel;
