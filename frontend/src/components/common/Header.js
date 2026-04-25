"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";
import "../../assets/css/HeaderFooter/common.css";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { user } = useAuth();

  console.log("this is y prof",user);

  return (
    <nav className="navbar">

      {/* LEFT - LOGO */}
      <div className="logo">
        <span>me2</span>vote
      </div>

      {/* CENTER - MENU */}
      <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
        <li><a href="#features">Features</a></li>
        <li><a href="/get-elections">Election's</a></li>
        <li><a href="#about">About</a></li>
      </ul>

      {/* RIGHT - BUTTON / PROFILE */}
      <div className="nav-btn">

        {user ? (
          <div className="profile-wrapper">

            <Image
              src={
                user.profile_picture
                  ? `${user?.profile_picture}`
                  : "/default.png"
              }
              alt="profile"
              className="profile-img"
              width={20}
              height={20}
              onClick={() => setProfileOpen(!profileOpen)}
              unoptimized={false} 
            />

            {/* 🔽 DROPDOWN */}
            {profileOpen && (
              <div className="profile-dropdown">
                <Link href="/profile_info">Profile</Link>
                <Link href="/result">Results</Link>
                <button
                  onClick={() => {
                    localStorage.clear(); // or your logout logic
                    window.location.href = "/login";
                  }}
                >
                  Logout
                </button>
              </div>
            )}

          </div>
        ) : (
          <Link className="get-started" href="/login">
            Let’s Get Started
          </Link>
        )}

      </div>

      {/* MOBILE MENU ICON */}
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

    </nav>
  );
}