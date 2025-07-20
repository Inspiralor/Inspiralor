"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Suspense } from "react";

function LoginFormWithParams({ setMessage }: { setMessage: (msg: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("message") === "login_required") {
      setMessage("Please sign in to submit a project.");
    }
  }, [searchParams, setMessage]);
  return null;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/landing");
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-surface to-primary/30 flex items-center justify-center py-10 px-4">
        <motion.form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-xl bg-glass shadow-glass p-8 flex flex-col gap-5 border border-border backdrop-blur-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Suspense fallback={null}>
            <LoginFormWithParams setMessage={setMessage} />
          </Suspense>
          <h1 className="text-3xl font-bold mb-2 text-primary font-display">
            Sign In
          </h1>
          {message && (
            <div className="text-accent font-semibold text-sm mb-2">
              {message}
            </div>
          )}
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
          <ErrorMessage message={error} />
          <motion.button
            type="submit"
            className="mt-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-accent transition-colors disabled:opacity-50"
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
          >
            Sign In
          </motion.button>
          <p className="mt-4 text-sm text-muted text-center">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-accent underline">
              Sign up
            </a>
          </p>
        </motion.form>
      </main>
    </>
  );
}
