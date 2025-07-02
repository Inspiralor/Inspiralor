"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useInView } from 'react-intersection-observer';
import { FaLinkedin, FaXTwitter, FaFacebook } from 'react-icons/fa6';
import type { User } from "@supabase/supabase-js";

function ProjectCard({ project, delay = 0 }: { project: any; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, type: "spring" }}
      className="rounded-xl bg-card/80 shadow-glass p-5 flex flex-col gap-2 border border-border hover:scale-[1.03] hover:shadow-lg transition-transform backdrop-blur-md"
    >
      <Link
        href={`/projects/${project.id}`}
        className="text-xl font-bold text-primary hover:underline"
      >
        {project.title}
      </Link>
      <div className="text-sm text-muted">{project.category}</div>
      <div className="text-gray-200 line-clamp-2">{project.description}</div>
      <div className="flex gap-2 flex-wrap text-xs mt-2">
        {project.tags?.map((tag: string) => (
          <span key={tag} className="bg-glass text-primary rounded px-2 py-0.5">
            #{tag}
          </span>
        ))}
      </div>
      <div className="text-xs text-muted mt-1">Status: {project.status}</div>
    </motion.div>
  );
}

export default function Home() {
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const { ref: inViewRef, inView: section1InView } = useInView({ threshold: 0.5 });

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: total } = await supabase.from("projects").select("id", { count: "exact", head: true });
      setTotalProjects(total || 0);
      const { count: users } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      setTotalUsers(users || 0);
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!section1Ref.current) return;
      const rect = section1Ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const visible = Math.max(0, windowHeight - rect.top);
      setZoom(1 + Math.min(visible / windowHeight, 1) * 0.08);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) window.location.href = `/signup?email=${encodeURIComponent(email)}`;
  };

  return (
    <div className="w-full">
      <Navbar isTransparent={section1InView} />
      {/* Section 1: Hero */}
      <div ref={el => { section1Ref.current = el; inViewRef(el); }} className="relative h-screen w-full overflow-hidden flex items-center">
        <Image src="/images/HomePage/Section1/Background.png" alt="Section 1" fill style={{ objectFit: 'cover', transform: `scale(${zoom})`, transition: 'transform 0.2s' }} />
        <div className="absolute inset-0 flex flex-col justify-center items-start px-8 md:px-32" style={{ zIndex: 2 }}>
          <h1 className="text-white text-5xl md:text-6xl font-extrabold leading-tight mb-4" style={{textShadow:'0 2px 16px rgba(0,0,0,0.4)'}}>
            <span className="underline decoration-4">Revive</span> Adopt, Remix,<br />and Revive<br />Unfinished Ideas
          </h1>
          <p className="text-white text-lg md:text-xl max-w-xl mb-8" style={{textShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>
            Join our community to discover, collaborate, and breathe new life into unfinished projects. Project Graveyard connects passionate individuals with innovative ideas waiting to be realized.
          </p>
          {!user && (
            <form className="flex gap-2 w-full max-w-md" onSubmit={handleSignup}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="rounded px-4 py-2 flex-1 text-white placeholder-white bg-black/40 border border-white" />
              <button type="submit" className="bg-emerald-400 text-white px-6 py-2 rounded">Sign up</button>
            </form>
          )}
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-black/30" />
      </div>

      {/* Section 2: Mission & Vision (white bg, black text) */}
      <div className="w-full bg-white py-20 text-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 px-4">
          <div className="flex-1">
            <h2 className="text-4xl font-extrabold mb-4">Our Mission & Vision</h2>
            <p className="text-lg mb-10">At Project Graveyard, we aim to breathe new life into abandoned projects by connecting creators and passionate individuals. Our platform fosters collaboration, transparency, and creativity to turn ideas into successful realities.</p>
            <div className="grid grid-cols-2 gap-8 text-center mt-8">
              <div>
                <div className="text-4xl font-bold">{totalProjects}</div>
                <div className="font-semibold">Total Projects</div>
              </div>
              <div>
                <div className="text-4xl font-bold">{totalUsers}</div>
                <div className="font-semibold">Active Collaborators</div>
              </div>
              <div>
                <div className="text-4xl font-bold">0</div>
                <div className="font-semibold">Total Projects Adopted</div>
              </div>
              <div>
                <div className="text-4xl font-bold">0</div>
                <div className="font-semibold">Projects In Progress</div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <Image src="/images/HomePage/Section2/OurMission&Vision.png" alt="Section 2" width={500} height={400} className="rounded-xl shadow-lg" />
          </div>
        </div>
      </div>

      {/* Section 3: Featured Projects (black bg, white text) */}
      <div className="w-full bg-black py-20 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold mb-6">Featured Projects</h2>
          <p className="text-lg mb-10 max-w-2xl">Explore a curated selection of our most impactful projects that demonstrate the power of community collaboration and idea revival.</p>
          <div className="w-full rounded-xl overflow-hidden mb-8">
            <Image src="/images/HomePage/Section3/FeaturedProject.png" alt="Section 3" width={1200} height={600} className="w-full object-cover" />
          </div>
        </div>
      </div>

      {/* Section 4: How Project Graveyard Works (match screenshot) */}
      <div className="w-full bg-white py-20 text-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-start gap-12 mb-12">
            <div className="flex-1">
              <h2 className="text-4xl font-extrabold mb-4">Unlocking Innovation: <br /><span className="italic">How <b>Project Graveyard</b> Works</span></h2>
            </div>
            <div className="flex-1">
              <p className="text-lg">Project Graveyard simplifies the process of reviving abandoned projects. Our platform connects creators with unfinished ideas to passionate individuals ready to collaborate. Discover how our intuitive tools and supportive community can help you transform forgotten concepts into thriving realities.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow p-0 flex flex-col">
              <Image src="/images/HomePage/Section4/BrowseAvaliableProjects.png" alt="Browse Projects" width={350} height={220} className="rounded-t-xl" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Browse Available Projects</h3>
                <p className="text-base mb-4">Explore a diverse range of abandoned projects seeking new life. Filter by category, skill set, or interest to find the perfect opportunity to contribute and collaborate.</p>
                <button className="mt-auto border border-emerald-400 text-emerald-400 px-6 py-2 rounded">Learn More</button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-0 flex flex-col">
              <Image src="/images/HomePage/Section4/ConnectAndCollaborate.png" alt="Connect and Collaborate" width={350} height={220} className="rounded-t-xl" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Connect and Collaborate</h3>
                <p className="text-base mb-4">Our platform provides integrated tools for seamless communication, resource sharing, and progress tracking. Connect with fellow collaborators and work together to bring projects to fruition.</p>
                <button className="mt-auto border border-emerald-400 text-emerald-400 px-6 py-2 rounded">Learn More</button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-0 flex flex-col">
              <Image src="/images/HomePage/Section4/ReviveAndLaunch.png" alt="Revive and Launch" width={350} height={220} className="rounded-t-xl" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Revive and Launch</h3>
                <p className="text-base mb-4">Transform forgotten ideas into successful endeavors with the support of the Project Graveyard community. Witness the impact of your contributions as projects come to life and make a difference.</p>
                <button className="mt-auto border border-emerald-400 text-emerald-400 px-6 py-2 rounded">Learn More</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Meet Innovators (gray bg, match screenshot) */}
      <div className="w-full bg-gray-100 py-20 text-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-start gap-12 mb-12">
            <div className="flex-1">
              <div className="uppercase text-sm font-bold mb-2">Our Team</div>
              <h2 className="text-4xl font-extrabold mb-2">Meet Innovators</h2>
              <p className="text-lg mb-8">Dedicated to connecting creators with unfinished ideas, fostering collaboration and innovation.</p>
              <button className="border border-emerald-400 text-emerald-400 px-6 py-2 rounded">Learn More</button>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <Image src="/images/HomePage/Section5/DavidLee.png" alt="Hok Wai Chan" width={250} height={250} className="rounded mb-4 object-cover" />
                <h4 className="text-xl font-bold mb-1">Hok Wai Chan</h4>
                <div className="text-base font-semibold mb-1">Software Developer</div>
                <p className="text-base text-center mb-2">Hok Wai is the developer and co-founder of Project Graveyard, bringing the technical vision to life through robust engineering and system design.</p>
                <div className="flex gap-2 mt-2">
                  <a href="#" className="text-black"><FaLinkedin size={20} /></a>
                  <a href="#" className="text-black"><FaXTwitter size={20} /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Become a Community Member (black bg, white text) */}
      {!user && (
        <div className="w-full bg-black py-32 text-white flex flex-col items-center justify-center">
          <h2 className="text-5xl font-extrabold mb-6 text-center">Become a Community Member</h2>
          <p className="text-xl mb-8 text-center max-w-2xl">Join Project Graveyard today and connect with passionate creators to bring abandoned ideas back to life.</p>
          <button className="bg-emerald-400 text-white px-8 py-4 rounded text-lg font-semibold hover:bg-emerald-500 transition-colors" onClick={() => window.location.href = '/signup'}>Join Now</button>
        </div>
      )}
    </div>
  );
}
