"use client";

import { useEffect } from "react";
import Swal from "sweetalert2";
import socket from "@/socket/socket";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";

export default function Globalnotifier() {
    console.log("🔥 Globalnotifier mounted");
    const { user } = useAuth();
    const router = useRouter();

    console.log("USER:", user);
    useEffect(() => {
        if (!user?.id) return;

        const handleConnect = () => {
            console.log("✅ Connected:", socket.id);
            socket.emit("join", user.id); // 👈 same as your code
        };

        const handleElection = (data) => {
            console.log("🎉 Global Received:", data);

            // 🎉 Confetti
            confetti({
                particleCount: 120,
                spread: 100,
                origin: { y: 0.6 }
            });

            Swal.fire({
                title: "🎉 Election Started",
                text: `${data.title} is now live! 🚀`,
                icon: "success",
                confirmButtonText: "Vote Now",
                showCancelButton: true,
                cancelButtonText: "Later",
                showCloseButton: true
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push(`/get-elections/vote-casting?electionId=${data.election_id}`);
                }
            });
        };

        socket.on("connect", handleConnect);
        socket.on("electionStarted", handleElection);

        if (socket.connected) {
            handleConnect();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("electionStarted", handleElection);
        };

    }, [user?.id, router]);

    return null;
}