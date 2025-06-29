"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      // Generate a unique, user-friendly ID (8-char nanoid)
      const uniqueId = Math.random().toString(36).substring(2, 10);
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ unique_id: uniqueId })
          .eq("id", data.user.id);
      }
      setSuccess("Check your email for a confirmation link.");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 flex items-center justify-center py-10 px-4">
        <motion.form
          onSubmit={handleSignup}
          className="w-full max-w-md rounded-xl bg-glass shadow-glass p-8 flex flex-col gap-5 border border-border backdrop-blur-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-3xl font-bold mb-2 text-primary font-display">
            Sign Up
          </h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-border bg-surface/60 rounded-xl px-4 py-2 text-white placeholder:text-muted focus:ring-2 focus:ring-primary outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-border bg-surface/60 rounded-xl px-4 py-2 text-white placeholder:text-muted focus:ring-2 focus:ring-primary outline-none"
            required
          />
          {error && (
            <div className="text-red-500 font-semibold text-sm">{error}</div>
          )}
          {success && (
            <div className="text-green-500 font-semibold text-sm">{success}</div>
          )}
          <motion.button
            type="submit"
            className="mt-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-accent transition-colors disabled:opacity-50"
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
          >
            Sign Up
          </motion.button>
          <p className="mt-4 text-sm text-muted text-center">
            Already have an account?{" "}
            <a href="/login" className="text-accent underline">
              Sign in
            </a>
          </p>
        </motion.form>
      </main>
    </>
  );
}
