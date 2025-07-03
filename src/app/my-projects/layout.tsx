import Navbar from "@/components/Navbar";

export default function MyProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
} 