import React from 'react';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import { Users, Target, Zap, Award, Heart, Globe } from 'lucide-react';

const AboutUsPage = () => {
  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Mission-Driven",
      description: "We're committed to making quality mentorship accessible to everyone, everywhere."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Community First",
      description: "We believe in the power of meaningful connections and collaborative learning."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Innovation",
      description: "Continuously evolving our platform to provide the best mentoring experience."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Excellence",
      description: "We maintain high standards in matching mentors and mentees for optimal growth."
    }
  ];

  const features = [
    {
      number: "1M+",
      label: "Learning Hours",
      description: "Mentors have provided over 1 million hours of mentorship guidance"
    },
    {
      number: "50K+",
      label: "Active Users",
      description: "Students and mentors actively learning and growing together"
    },
    {
      number: "95%",
      label: "Satisfaction Rate",
      description: "Our users consistently rate their mentoring experience highly"
    },
    {
      number: "24/7",
      label: "Support Available",
      description: "We're here whenever you need assistance or guidance"
    }
  ];

  const team = [
    {
      name: "Arsh Chauhan",
      role: "Founder & Lead Developer",
      description: "Passionate about creating innovative solutions for education and mentorship"
    },
    {
      name: "Ayaan Shaikh",
      role: "Frontend Developer",
      description: "Building intuitive and beautiful user experiences for our community"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0f0f] to-[#0d0d0d] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <LandingNavbar />

        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              About <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Ment2Be</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Empowering students and professionals through meaningful mentorship and collaborative learning
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact-us"
                className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get in Touch
              </Link>
              <Link
                to="/register"
                className="px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Join Our Community
              </Link>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Story</h2>
                <p className="text-lg text-gray-300 mb-4">
                  Ment2Be was born from a simple yet powerful idea: quality mentorship should be accessible to everyone, regardless of their background or location.
                </p>
                <p className="text-lg text-gray-300 mb-4">
                  We recognized that countless talented individuals have invaluable knowledge to share, and many more are eager to learn from experienced mentors. Our mission is to bridge this gap and create meaningful connections that drive growth and success.
                </p>
                <p className="text-lg text-gray-300">
                  Today, we're proud to host a vibrant community of students, professionals, and mentors from around the world, all working together to achieve their goals and make a positive impact.
                </p>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/50 rounded-2xl p-8">
                  <div className="text-center">
                    <Globe className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Global Community</h3>
                    <p className="text-gray-300">
                      Connecting mentors and students across continents
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center">By The Numbers</h2>
            <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 text-center hover:border-red-500/50 transition-colors">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
                    {feature.number}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.label}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-red-500/50 transition-colors">
                  <div className="text-red-500 mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-gray-400">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center">Our Team</h2>
            <div className="grid md:grid-cols-2 gap-12">
              {team.map((member, index) => (
                <div key={index} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 hover:border-red-500/50 transition-colors">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                      <p className="text-red-500 font-medium">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-300">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/50 rounded-2xl p-12">
              <h2 className="text-4xl font-bold text-white mb-6">Our Vision</h2>
              <p className="text-xl text-gray-300 mb-4">
                We envision a world where every individual has access to expert guidance and mentorship, enabling them to unlock their full potential and achieve their dreams.
              </p>
              <p className="text-xl text-gray-300">
                Through Ment2Be, we're building a global ecosystem of continuous learning, where knowledge flows freely, connections are genuine, and success is shared.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 mb-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of students and mentors already making a difference on Ment2Be
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start Learning Today
              </Link>
              <Link
                to="/contact-us"
                className="px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </div>
  );
};

export default AboutUsPage;
