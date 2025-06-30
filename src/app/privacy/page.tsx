import Navbar from "@/components/Navbar";

// Navbar is now handled globally in layout.tsx
export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white flex flex-col items-center px-4 py-10">
        <section className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <div className="text-gray-700 mb-4">ProjectAdopt Privacy Policy</div>
          <div className="text-sm text-gray-500 mb-4">Last Updated: October 26, 2023</div>
          <p className="mb-4">ProjectAdopt respects your privacy and is committed to protecting your personal information. This Privacy Policy describes how we collect, use, and protect your data when you use our platform.</p>
          <h2 className="font-bold mt-6 mb-2">1. Information We Collect</h2>
          <ul className="list-disc list-inside mb-4 text-gray-700">
            <li>Information you provide when creating an account</li>
            <li>Information you provide when submitting a project</li>
            <li>Information you provide when contacting us</li>
            <li>Information collected automatically, such as your IP address and browser type</li>
          </ul>
          <h2 className="font-bold mt-6 mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside mb-4 text-gray-700">
            <li>Operate and maintain our platform</li>
            <li>Provide you with the services you request</li>
            <li>Personalize your experience</li>
            <li>Communicate with you about your account</li>
            <li>Improve our platform</li>
          </ul>
          <h2 className="font-bold mt-6 mb-2">3. Information Sharing</h2>
          <p className="mb-4">We may share your information with third-party service providers who assist us in operating our platform. We will not share your information with third parties for their marketing purposes without your explicit consent.</p>
          <h2 className="font-bold mt-6 mb-2">4. Security</h2>
          <p className="mb-4">We implement reasonable security measures to protect your information from unauthorized access, use, or disclosure.</p>
          <h2 className="font-bold mt-6 mb-2">5. Your Choices</h2>
          <p className="mb-4">You have the right to access, correct, or delete your personal information. You can also opt-out of receiving certain communications from us.</p>
          <h2 className="font-bold mt-6 mb-2">6. Contact Us</h2>
          <p>If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:support@projectadopt.com" className="text-emerald-600 underline">support@projectadopt.com</a>.</p>
        </section>
      </main>
    </>
  );
} 