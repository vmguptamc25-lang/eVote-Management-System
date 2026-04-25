"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardStats from "@/components/admincomponents/DashboardStats";
import ActiveElections from "@/components/admincomponents/ActiveElections";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
  }, [loading, user, router]);

  // ⏳ While checking auth
  if (loading) {
    return <p>Loading...</p>;
  }

  // 🚫 If not logged in or not admin → don't render
  if (!user || user.role !== "ADMIN") {
    return null;
  }

  // ✅ Only ADMIN can see this
  return (
    <div className="admin-content">
      <h3>Dashboard Overview</h3>
      <p className="text-muted">
        Monitor and manage all elections from one place
      </p>

      <DashboardStats />
      <ActiveElections />
    </div>
  );
}