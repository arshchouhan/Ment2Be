import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import { Check, X, Zap } from 'lucide-react';

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for getting started",
      monthlyPrice: 0,
      annualPrice: 0,
      badge: "Free",
      popular: false,
      color: "from-blue-500 to-cyan-500",
      features: [
        { name: "Up to 2 mentor connections", included: true },
        { name: "Basic profile", included: true },
        { name: "Community forum access", included: true },
        { name: "Monthly mentorship sessions", included: false },
        { name: "Priority support", included: false },
        { name: "Advanced analytics", included: false },
        { name: "Custom learning plans", included: false },
        { name: "Certification programs", included: false }
      ],
      cta: "Get Started",
      ctaLink: "/register"
    },
    {
      name: "Professional",
      description: "For serious learners",
      monthlyPrice: 29,
      annualPrice: 290,
      badge: "Most Popular",
      popular: true,
      color: "from-red-500 to-orange-500",
      features: [
        { name: "Unlimited mentor connections", included: true },
        { name: "Premium profile with badges", included: true },
        { name: "Priority community access", included: true },
        { name: "4 sessions per month", included: true },
        { name: "Priority support (24hrs)", included: true },
        { name: "Basic analytics dashboard", included: true },
        { name: "Customizable profile", included: false },
        { name: "Basic certification access", included: false }
      ],
      cta: "Start Free Trial",
      ctaLink: "/register"
    },
    {
      name: "Premium",
      description: "For dedicated professionals",
      monthlyPrice: 79,
      annualPrice: 790,
      badge: "Best Value",
      popular: false,
      color: "from-purple-500 to-pink-500",
      features: [
        { name: "Unlimited everything", included: true },
        { name: "Elite profile with verification", included: true },
        { name: "VIP community access", included: true },
        { name: "Unlimited sessions", included: true },
        { name: "24/7 dedicated support", included: true },
        { name: "Advanced analytics & insights", included: true },
        { name: "Personalized learning plans", included: true },
        { name: "All certification programs", included: true }
      ],
      cta: "Start Free Trial",
      ctaLink: "/register"
    }
  ];

  const faqs = [
    {
      question: "Can I change my plan anytime?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
    },
    {
      question: "Is there a free trial?",
      answer: "Professional and Premium plans come with a 7-day free trial. No credit card required to start."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital payment methods including PayPal and Google Pay."
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Absolutely! You can cancel anytime without penalties. Your access continues until the end of your billing period."
    },
    {
      question: "Is there a student discount?",
      answer: "Yes! Students can get 50% off any plan with a valid .edu email address."
    },
    {
      question: "What if I need a custom plan?",
      answer: "For teams or enterprise needs, contact our sales team at contact@ment2be.com for custom pricing."
    }
  ];

  const comparisons = [
    { feature: "Mentor connections", starter: "2", pro: "Unlimited", premium: "Unlimited" },
    { feature: "Mentorship sessions", starter: "Limited", pro: "4/month", premium: "Unlimited" },
    { feature: "Community forum", starter: "Standard", pro: "Priority", premium: "VIP" },
    { feature: "Support response time", starter: "48 hours", pro: "24 hours", premium: "2 hours" },
    { feature: "Analytics dashboard", starter: "No", pro: "Yes", premium: "Advanced" },
    { feature: "Personalized learning plans", starter: "No", pro: "No", premium: "Yes" },
    { feature: "Certification programs", starter: "No", pro: "Limited", premium: "Full access" },
    { feature: "Profile verification", starter: "No", pro: "Basic", premium: "Elite" }
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
              Simple, Transparent <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Pricing</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Choose the perfect plan for your mentorship journey
            </p>
          </div>
        </section>

        {/* Billing Toggle */}
        <section className="py-8 px-6 text-center">
          <div className="max-w-md mx-auto">
            <div className="inline-flex items-center bg-[#1a1a1a] border border-gray-800 rounded-full p-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  !isAnnual
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  isAnnual
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Annual
              </button>
            </div>
            {isAnnual && (
              <p className="text-green-500 text-sm font-semibold mt-4">
                Save up to 20% with annual billing
              </p>
            )}
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative rounded-2xl transition-all duration-300 ${
                    plan.popular
                      ? 'md:scale-105 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-red-500/50 shadow-2xl shadow-red-500/20'
                      : 'bg-[#1a1a1a] border border-gray-800 hover:border-red-500/30'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                        <Zap className="w-4 h-4" />
                        <span>{plan.badge}</span>
                      </div>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Plan Name */}
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-5xl font-bold text-white">
                          ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-gray-400 ml-2">
                          {isAnnual ? '/year' : '/month'}
                        </span>
                      </div>
                      {plan.monthlyPrice === 0 && (
                        <p className="text-green-500 text-sm font-semibold mt-2">Forever free</p>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Link
                      to={plan.ctaLink}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all mb-8 block text-center ${
                        plan.popular
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:shadow-red-500/50'
                          : 'border border-white text-white hover:bg-white/10'
                      }`}
                    >
                      {plan.cta}
                    </Link>

                    {/* Features List */}
                    <div className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                          )}
                          <span
                            className={
                              feature.included ? 'text-gray-300' : 'text-gray-600 line-through'
                            }
                          >
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-12 text-center">
              Detailed Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-6 text-white font-semibold">Feature</th>
                    <th className="text-center py-4 px-6 text-white font-semibold">Starter</th>
                    <th className="text-center py-4 px-6 text-white font-semibold">Professional</th>
                    <th className="text-center py-4 px-6 text-white font-semibold">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((comparison, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                    >
                      <td className="py-4 px-6 text-gray-300">{comparison.feature}</td>
                      <td className="text-center py-4 px-6 text-gray-400">{comparison.starter}</td>
                      <td className="text-center py-4 px-6 text-green-400 font-semibold">
                        {comparison.pro}
                      </td>
                      <td className="text-center py-4 px-6 text-green-400 font-semibold">
                        {comparison.premium}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-red-500/30 transition-colors cursor-pointer"
                >
                  <summary className="flex items-center justify-between font-semibold text-white select-none">
                    <span>{faq.question}</span>
                    <span className="transform group-open:rotate-180 transition-transform">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="text-gray-400 mt-4">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/50 rounded-2xl p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Need a Custom Solution?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                For teams, enterprises, or special requirements, we offer custom pricing and dedicated support.
              </p>
              <Link
                to="/contact-us"
                className="inline-block px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contact Our Sales Team
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 mb-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of students and mentors already learning together
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start Free Today
              </Link>
              <Link
                to="/contact-us"
                className="px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Schedule a Demo
              </Link>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </div>
  );
};

export default PricingPage;
