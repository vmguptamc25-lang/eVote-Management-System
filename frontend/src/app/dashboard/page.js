"use client"
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) return null;


  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h1>Welcome 🎉</h1>

      {user && (
        <>
          {(
            <Image
              src={user.picture}
              alt="Profile"
              width={80}
              height={80}
              style={{ borderRadius: "50%" }}
            />
          )}

          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <p>{user.role}</p>
        </>
      )}
    </div>
  );
}
