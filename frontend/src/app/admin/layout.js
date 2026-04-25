import AdminSidebar from "@/components/admincomponents/AdminSidebar";
import "@/assets/css/admin.css";
import "@/assets/css/create-election.css";
import { Inter } from "next/font/google";


export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
}
