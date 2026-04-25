"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function GoogleLoginButton() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 🔁 If already logged in, redirect
  useEffect(() => {
    if (!loading && user) {
      router.replace("/get-started");
    }
  }, [user, loading, router]);

  if (loading) {
    return <p className="text-center mt-5">Checking session...</p>;
  }

  if (user) {
    return null; // prevent flicker
  }

  // ✅ Handle Google login success
  const handleSuccess = async (response) => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/google",
        { token: response.credential },
        { withCredentials: true } // 🔥 store JWT cookie
      );

      // 🚀 Redirect immediately after successful login
      router.replace("/get-started");
    } catch (err) {
      console.error(err);
      alert("Login Failed");
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => alert("Google Login Failed")}
    />
  );
}
