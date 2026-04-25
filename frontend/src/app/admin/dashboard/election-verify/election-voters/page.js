"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import VoterManagement from "@/components/election-voters/VoterManagement";

export default function Page() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const { user, loading ,setLoading } = useAuth();


  // 🔐 AUTH + ROLE GUARD
  useEffect(() => {
    if (!loading) {
      // Not logged in
      if (!user) {
        router.replace("/login");
      }
      // Logged in but not ADMIN
      else if (user.role !== "ADMIN") {
        router.replace("/"); // or "/unauthorized"
      }
    }

    const electionId = localStorage.getItem("verifiedElectionId");

    if (!electionId) {
      router.push("/admin/dashboard/election-verify");
    } else {
      setAllowed(true);
    }
  }, [loading, user, router]);

  // ⏳ While checking auth
  if (loading) {
    return <p>Loading...</p>;
  }

  // 🚫 If not logged in or not admin → don't render
  if (!user || user.role !== "ADMIN") {
    return null;
  }

  // useEffect(() => {
    
  // }, []);

  if (!allowed) return null;

  return <VoterManagement />;
}