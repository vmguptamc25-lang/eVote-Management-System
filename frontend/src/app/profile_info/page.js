"use client"
import Swal from "sweetalert2";
import socket from "@/socket/socket";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import ProfileHeader from "../../components/profile-components/ProfileHeader";
import PersonalInfo from "../../components/profile-components/PersonalInfo";
import SecurityInfo from "../../components/profile-components/SecurityInfo";
import Activity from "../../components/profile-components/Activity";
import { useState, useEffect } from "react";
import "@/assets/css/profile.css";


export default function Home() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const router = useRouter();


  // ✅ Fetch profile
  useEffect(() => {
    if (!user?.id) return;

    fetch(`http://localhost:5000/api/profile/${user.id}`)
      .then(res => res.json())
      .then(data => {
        // console.log("PROFILE DATA:", data); // 👈 ADD THIS
        setProfile(data)
      })
      .catch(err => console.error(err));
  }, [user]);

  // useEffect(() => {
  //   if (!user?.id) return;

  //   const handleConnect = () => {
  //     console.log("✅ Connected:", socket.id);
  //     socket.emit("join", user.id);
  //   };

  //   const handleElection = (data) => {
  //     console.log("🎉 Received:", data);
  //     // alert(`Election Started: ${data.title}`);
  //     Swal.fire({
  //       title: "Election Started",
  //       text: `${data.title} is now live! 🚀`,
  //       icon: "info",       // ✅ adds "Close / Later"
  //       confirmButtonText: "Vote Now",
  //       showCloseButton: true  
  //     }).then(() => {
  //       router.push(`/get-elections/vote-casting?electionId=${data.election_id}`);
  //     });
  //   };

  //   // ✅ attach listeners ONCE
  //   socket.on("connect", handleConnect);
  //   socket.on("electionStarted", handleElection);

  //   // ✅ if already connected
  //   if (socket.connected) {
  //     handleConnect();
  //   }

  //   return () => {
  //     socket.off("connect", handleConnect);
  //     socket.off("electionStarted", handleElection);
  //   };

  // }, [user?.id]);

  if (loading) {
    return <div className="text-center mt-5">Loading user...</div>;
  }

  if (!user) {
    router.push("/login");
  }

  // ✅ IMPORTANT FIX
  if (!profile) {
    return <div className="text-center mt-5">Loading profile...</div>;
  }
  return (
    <div className="container mt-4">
      <ProfileHeader data={profile.header} />

      <div className="row mt-3">
        <div className="col-md-6">
          <PersonalInfo data={profile.personal} />
        </div>

        <div className="col-md-6">
          <SecurityInfo data={profile.security} />
        </div>
      </div>

      <Activity data={profile.activity} />
    </div>
  );
}