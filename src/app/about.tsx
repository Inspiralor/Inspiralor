"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 flex items-center justify-center py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-3xl rounded-2xl bg-glass shadow-glass p-10 border-2 border-gold backdrop-blur-md flex flex-col gap-8"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <Image src="/images/Icon.jpeg" alt="Project Graveyard Icon" fill className="rounded-full border-4 border-gold shadow-lg bg-white object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-primary font-display mb-2 drop-shadow-lg">About Project Graveyard</h1>
            <p className="text-lg text-muted font-medium">A creative adoption hub for unfinished projects in code, art, writing, research, games, designs, inventions, and more. Discover, adopt, and remix abandoned works from all fields.</p>
          </div>
        </div>
        <div className="rounded-xl bg-surface/70 border border-gold p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-gold mb-2">Project Idea</h2>
          <p className="text-lg text-accent">Project Graveyard is a platform where creators can share their abandoned or unfinished projects, giving others the chance to adopt, remix, or revive them. It aims to reduce wasted creativity and foster collaboration across disciplines.</p>
        </div>
        <div className="rounded-xl bg-surface/70 border border-gold p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-gold mb-2">How to Use</h2>
          <ul className="list-disc ml-6 text-lg text-accent space-y-2">
            <li>Sign up and create your profile, including your interests and social links.</li>
            <li>Browse the graveyard of abandoned projects or use filters to find something that inspires you.</li>
            <li>View project details, including images, files, and the creator's story.</li>
            <li>Adopt a project to continue, remix, or collaborate on it.</li>
            <li>Submit your own abandoned projects to help them find new life.</li>
          </ul>
        </div>
        <div className="rounded-xl bg-surface/70 border border-gold p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-gold mb-2">Key Features</h2>
          <ul className="list-disc ml-6 text-lg text-accent space-y-2">
            <li>Beautiful, modern UI with a unique color palette and branding.</li>
            <li>Profile pages with image upload, social links, and project history.</li>
            <li>Project pages with image/file previews and detailed descriptions.</li>
            <li>Easy project submission with file/image upload and tagging.</li>
            <li>Responsive design for all devices.</li>
            <li>Integration with Supabase for authentication, storage, and database.</li>
          </ul>
        </div>
      </motion.div>
    </main>
  );
} 