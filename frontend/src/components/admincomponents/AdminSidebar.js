"use client";

import { useRouter } from "next/navigation";

export default function AdminSidebar() {
  const router = useRouter();

  return (
    <div className="admin-sidebar">
      <h4 className="logo">🗳 Admin Panel</h4>

      <ul>
        <li
          className="active"
          onClick={() => router.push("/admin/dashboard")}
        >
          Overview
        </li>

        <li
          onClick={() => router.push("/admin/dashboard/create-election")}
        >
          Create Election
        </li>

        <li
          onClick={() => router.push("/admin/dashboard/manage-elections")}
        >
          Manage Elections
        </li>

        <li
          onClick={() => router.push("/admin/dashboard/election-nominee")}
        >
          Nomination  
        </li>

        <li
          onClick={() => router.push("/admin/dashboard/election-verify")}
        >
          Voters
        </li>

        <li
          onClick={() => router.push("/admin/audit-logs")}
        >
          Audit Logs
        </li>
      </ul>
    </div>
  );
}
