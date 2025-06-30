// Navbar is now handled globally in layout.tsx
export default function ContactPage() {
  return (
    <>
      <main className="min-h-screen bg-white flex flex-col items-center px-4 py-10">
        <section className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center mb-12">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch with ProjectAdopt</h1>
            <p className="text-gray-700 mb-8">Interested in collaborating or have questions? Reach out to our passionate team at ProjectAdopt. We are here to help you bring your ideas to life. Contact us via email, phone, or visit us at our San Francisco office. Join our community and start transforming forgotten projects today!</p>
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-3xl font-bold">100 k</div>
                <div className="text-gray-500">Projects Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold">250 k</div>
                <div className="text-gray-500">Active Collaborators</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50 k</div>
                <div className="text-gray-500">Projects in Progress</div>
              </div>
              <div>
                <div className="text-3xl font-bold">120 k</div>
                <div className="text-gray-500">Community Members</div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img src="/images/Contact/Contact.png" alt="Team meeting" className="rounded-xl shadow-lg w-full max-w-md" />
          </div>
        </section>
        <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="flex flex-col items-start">
            <span className="text-3xl mb-2">✉️</span>
            <h2 className="font-bold text-lg mb-2">Get in Touch</h2>
            <p className="text-gray-700 text-sm mb-2">Reach out to the ProjectAdopt team for collaboration opportunities, questions, or support. You can fill out our contact form, email us directly at <a href='mailto:contact@projectadopt.com' className='text-emerald-600 underline'>contact@projectadopt.com</a>, or connect with us on social media. We look forward to hearing from you and exploring how we can work together to bring ideas to life.</p>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-3xl mb-2">📞</span>
            <h2 className="font-bold text-lg mb-2">Call Us</h2>
            <p className="text-gray-700 text-sm mb-2">Call us at <a href='tel:+14155550199' className='text-emerald-600 underline'>+1 415-555-0199</a> for immediate assistance or inquiries. Our team is available during business hours to support your collaboration efforts and answer any questions you may have.</p>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-3xl mb-2">📍</span>
            <h2 className="font-bold text-lg mb-2">Visit Us</h2>
            <p className="text-gray-700 text-sm mb-2">Our office is located at 123 Market Street, San Francisco, CA 94103. You can view the location on <a href='https://maps.google.com/?q=123+Market+Street,+San+Francisco,+CA+94103' className='text-emerald-600 underline' target='_blank' rel='noopener noreferrer'>Google Maps</a> for directions and parking information.</p>
          </div>
        </section>
      </main>
    </>
  );
} 