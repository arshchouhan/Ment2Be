import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-gray-200 py-20 px-4">
      <div className="max-w-4xl mx-auto">

        <Link
  to="/"
  className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-6"
>
  ← Back to Home
</Link>

        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="mt-4 text-gray-400">
            Your privacy matters to us. Learn how Ment2Be handles your data.
          </p>
        </div>

        {/* Content Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 space-y-8">

          <Section title="Introduction">
            Ment2Be respects your privacy and is committed to protecting your
            personal information. This Privacy Policy explains how we collect,
            use, and safeguard your data when you use our platform.
          </Section>

          <Section title="Information We Collect">
            <ul className="list-disc list-inside space-y-2">
              <li>Name, email address, and profile details</li>
              <li>Mentor / mentee account information</li>
              <li>Usage and interaction data to improve user experience</li>
            </ul>
          </Section>

          <Section title="How We Use Your Information">
            <ul className="list-disc list-inside space-y-2">
              <li>Provide and maintain platform functionality</li>
              <li>Improve mentoring experience and features</li>
              <li>Send important updates and security notifications</li>
            </ul>
          </Section>

          <Section title="Data Sharing">
            We do not sell or rent your personal information. Data is only shared
            when legally required or necessary to protect Ment2Be and its users.
          </Section>

          <Section title="Data Security">
            We implement industry-standard security measures to protect your
            data. However, no method of transmission over the internet is 100%
            secure.
          </Section>

          <Section title="Third-Party Services">
            Ment2Be may use trusted third-party tools (authentication, analytics,
            hosting). Their data handling practices are governed by their own
            privacy policies.
          </Section>

          <Section title="Policy Updates">
            This Privacy Policy may be updated periodically. Continued use of the
            platform indicates acceptance of the revised policy.
          </Section>

          <Section title="Contact Us">
            If you have questions about this Privacy Policy, please reach out to
            the Ment2Be team through official communication channels.
          </Section>

        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-10">
          © {new Date().getFullYear()} Ment2Be. All rights reserved.
        </p>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <h2 className="text-xl font-semibold text-white mb-3">
      {title}
    </h2>
    <div className="text-gray-300 leading-relaxed">
      {children}
    </div>
  </div>
);

export default PrivacyPolicy;
