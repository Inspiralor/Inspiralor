import Navbar from "@/components/Navbar";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="text-black min-h-screen bg-white flex flex-col items-center px-4 py-10 pt-24">
        <section className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
          <div className="text-gray-700 mb-4">
            Inspiralor Terms and Conditions
          </div>
          <div className="text-sm text-gray-500 mb-4">
            Last Updated: July 1, 2025
          </div>
          <p className="mb-4">
            Welcome to Inspiralor! These Terms and Conditions govern your use of
            our platform. By accessing or using Inspiralor, you agree to be
            bound by these terms.
          </p>
          <h2 className="font-bold mt-6 mb-2">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By using Inspiralor, you acknowledge that you have read, understood,
            and agree to be bound by these Terms and Conditions. If you do not
            agree to these terms, you are prohibited from using Inspiralor.
          </p>
          <h2 className="font-bold mt-6 mb-2">2. Account Creation and Use</h2>
          <p className="mb-4">
            To use Inspiralor, you must create an account. You are responsible
            for maintaining the confidentiality of your account credentials and
            for all activities that occur under your account. You agree to
            provide accurate and complete information when creating your
            account.
          </p>
          <h2 className="font-bold mt-6 mb-2">3. Project Submissions</h2>
          <p className="mb-4">
            You are responsible for the content of any project you submit to
            Inspiralor. You represent and warrant that you have the necessary
            rights to submit the project and that the project does not infringe
            on the intellectual property rights of others.
          </p>
          <h2 className="font-bold mt-6 mb-2">4. Intellectual Property</h2>
          <p className="mb-4">
            All intellectual property rights in and to Inspiralor, including but
            not limited to the design, text, graphics, logos, and trademarks,
            are owned by Inspiralor or its licensors. You agree not to
            reproduce, distribute, or modify any part of Inspiralor without
            express written permission.
          </p>
          <h2 className="font-bold mt-6 mb-2">5. Limitation of Liability</h2>
          <p className="mb-4">
            Inspiralor is not liable for any damages arising from your use of
            the platform, including but not limited to direct, indirect,
            incidental, consequential, or punitive damages.
          </p>
          <h2 className="font-bold mt-6 mb-2">6. Governing Law</h2>
          <p className="mb-4">
            These Terms and Conditions shall be governed by and construed in
            accordance with the laws of [Your State/Country].
          </p>
          <h2 className="font-bold mt-6 mb-2">7. Changes to Terms</h2>
          <p className="mb-4">
            Inspiralor reserves the right to modify these Terms and Conditions
            at any time. Any changes will be effective upon posting to the
            website.
          </p>
          <h2 className="font-bold mt-6 mb-2">8. Contact Us</h2>
          <p>
            If you have any questions or concerns regarding these Terms and
            Conditions, please contact us at{" "}
            <a
              href="mailto:hokwai24@gmail.com"
              className="text-emerald-600 underline"
            >
              hokwai24@gmail.com
            </a>
            .
          </p>
        </section>
      </main>
    </>
  );
}
