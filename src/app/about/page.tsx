"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white flex flex-col items-center px-4 py-10">
        <section className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-center mb-12">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Journey and Mission</h1>
            <p className="text-gray-700 mb-4">
              At ProjectAdopt, we are committed to breathing new life into abandoned projects by connecting creators with passionate individuals. Our platform emphasizes community, innovation, and transparency, fostering a vibrant ecosystem where ideas flourish and turn into successful realities. Join us in transforming forgotten concepts into impactful projects and be part of a movement driven by creativity and passion.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <img src="/images/About/About.png" alt="Team collaborating" className="rounded-xl shadow-lg w-full max-w-md" />
          </div>
        </section>
        <section className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-center mb-16">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-500 mb-2 uppercase tracking-wider">Meet the Team</h2>
            <h3 className="text-3xl font-bold mb-4">Ready to Collaborate?</h3>
            <p className="text-gray-700 mb-6">Discover the team that powers ProjectAdopt and drives innovation in project revival.</p>
            <button className="border border-emerald-400 text-emerald-600 px-4 py-2 rounded hover:bg-emerald-50 transition-colors">Explore Projects</button>
          </div>
          <div className="flex-1 flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Alex Johnson" className="w-20 h-20 rounded-full object-cover border-2 border-emerald-400" />
              <div>
                <h4 className="font-bold text-lg">Alex Johnson</h4>
                <div className="text-sm text-gray-500 mb-1">Founder & CEO</div>
                <div className="text-sm text-gray-700">Visionary leader with a passion for connecting creators and revitalizing abandoned projects.</div>
                <div className="flex gap-2 mt-1">
                  <span className="text-gray-400"><i className="fab fa-twitter"></i></span>
                  <span className="text-gray-400"><i className="fab fa-linkedin"></i></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Maria Lopez" className="w-20 h-20 rounded-full object-cover border-2 border-emerald-400" />
              <div>
                <h4 className="font-bold text-lg">Maria Lopez</h4>
                <div className="text-sm text-gray-500 mb-1">Chief Technology Officer</div>
                <div className="text-sm text-gray-700">Expert in platform development, ensuring seamless collaboration tools for project success.</div>
                <div className="flex gap-2 mt-1">
                  <span className="text-gray-400"><i className="fab fa-twitter"></i></span>
                  <span className="text-gray-400"><i className="fab fa-linkedin"></i></span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
} 