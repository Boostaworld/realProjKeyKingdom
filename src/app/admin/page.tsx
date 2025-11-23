"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if logged in
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (isLoggedIn) {
      router.push("/admin/dashboard");
    } else {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0E11]">
      <div className="text-white">Redirecting...</div>
    </div>
  );
}
