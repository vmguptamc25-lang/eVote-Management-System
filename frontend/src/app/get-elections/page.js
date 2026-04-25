"use client";
import socket from "../../socket/socket.js";
import { MdLocationPin } from "react-icons/md";
import { FaCalendarAlt, FaUserFriends, FaRegClock } from "react-icons/fa";
import { MdHowToVote } from "react-icons/md";

import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

import { useAuth } from "../../context/AuthContext";
import "@/assets/css/get-elections.css";

export default function ElectionPortal() {

  const { user, loading, setLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [elections, setElections] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // NEW STATE (added)
  const [electionIds, setElectionIds] = useState([]);

  const cardsPerPage = 25;

  // useEffect(() => {
  //   fetchElections();
  // }, []);

  // NEW useEffect (added)
  useEffect(() => {
    if (user?.id) {
      fetchElectionIds(user.id);
    }
  }, [user]);


  const handleVoteClick = async (electionId) => {
    try {
      // Step 1: check face registered
      const res = await axios.get("http://localhost:5000/api/face/me", {
        withCredentials: true,
      });

      if (!res.data.descriptor) {
        alert("⚠️ Please register your face first");
        return;
      }

      // Step 2: redirect to face verification page
      window.open(
        `/face-verify?electionId=${electionId}`,
        "_blank"
      );

    } catch (err) {
      alert("⚠️ Face not registered. Please register first.");
    }
  };

  const fetchElections = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/elections/all");
      setElections(res.data);
    } catch (error) {
      console.error("Error fetching elections", error);
    }
  };

  useEffect(() => {
    const fetchElectionVotes = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/elections/allElectionVote"
        );
        console.log("This is my data:-", res.data);
        setElections(res.data);
      } catch (error) {
        console.error("Error fetching elections", error);
      }
    };
    fetchElectionVotes();
  }, []);

  // NEW FUNCTION (added)
  const fetchElectionIds = async (userId) => {
    try {

      const res = await axios.get(
        `http://localhost:5000/api/elections/ids/${userId}`
      );

      console.log("Election IDs for voter:", res.data);

      setElectionIds(res.data);

    } catch (error) {
      console.error("Error fetching election ids", error);
    }
  };

  // SEARCH FILTER
  const filtered = elections.filter((e) => {
    const matchesSearch = e.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || e.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // PAGINATION LOGIC
  const indexOfLast = currentPage * cardsPerPage;
  const indexOfFirst = indexOfLast - cardsPerPage;
  const currentElections = filtered.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filtered.length / cardsPerPage);

  // RESET PAGE WHEN SEARCH CHANGES
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {

    socket.on("vote-update", (data) => {
      console.log("🔥 Real-time vote update:", data);

      setElections((prev) =>
        prev.map((election) => {

          // ✅ FIX: convert BOTH to number
          if (Number(election.id) === Number(data.electionId)) {
            return {
              ...election,
              total_votes: Number(data.totalVotes)
            };
          }

          return election;
        })
      );

    });

    return () => {
      socket.off("vote-update");
    };

  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const ongoing = elections.filter((e) => e.status === "ACTIVE").length;
  const upcoming = elections.filter((e) => e.status === "CREATED").length;
  const completed = elections.filter((e) => e.status === "RESULT_PUBLISHED").length;

  return (
    <div className="container py-4 election-wrapper">

      <h2 className="portal-title">Election Portal</h2>
      <p className="portal-subtitle">
        Monitor and participate in democratic elections
      </p>

      {/* SEARCH */}
      <input
        type="text"
        className="form-control search-box"
        placeholder="Search elections..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        className="form-select mt-2"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="ALL">All Elections</option>
        <option value="ACTIVE">Ongoing</option>
        <option value="CREATED">Upcoming</option>
        <option value="RESULT_PUBLISHED">Completed</option>
      </select>
      <div className="mb-4">
      </div>

      {/* STATS */}
      <div className="row stats-row">

        <div className="col-md-3">
          <div className="stat-card stat-ongoing">
            <h3>{ongoing}</h3>
            <p>Ongoing Elections</p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card stat-upcoming">
            <h3>{upcoming}</h3>
            <p>Upcoming Elections</p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card stat-completed">
            <h3>{completed}</h3>
            <p>Completed Elections</p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card stat-voters">
            <h3>
              {elections.reduce((sum, e) => sum + (e.total_votes || 0), 0)}
            </h3>
            <p>Total Votes Cast</p>
          </div>
        </div>

      </div>



      {/* ELECTION LIST */}
      <div className="row">

        {currentElections.map((election) => (

          <div className="col-md-6 col-lg-4" key={election.id}>

            <div className="election-card">

              {election.status === "ACTIVE" &&
                <span className="badge badge-live">
                  <FaRegClock /> Live Now
                </span>
              }

              {election.status === "CREATED" &&
                <span className="badge badge-upcoming">
                  <FaRegClock /> Upcoming
                </span>
              }

              {election.status === "RESULT_PUBLISHED" &&
                <span className="badge badge-completed">
                  Completed
                </span>
              }

              <h5>{election.title}</h5>

              <p className="desc">
                {election.description || "No description available"}
              </p>

              <div className="meta">
                <MdLocationPin size={20} color="grey" />
                <span>Online</span>
              </div>

              <p className="date">
                <FaCalendarAlt size={20} color="grey" />
                {new Date(election.start_time).toLocaleDateString()} -
                {new Date(election.end_time).toLocaleDateString()}
              </p>

              <p className="registered">
                <FaUserFriends size={20} color="grey" />
                {election.total_votes || 0} votes recorded
              </p>

              {
                electionIds.some((ev) => ev.election_id === election.id) && (
                  <button
                    className="btn btn-success"
                    disabled={election.status !== "ACTIVE"}
                    onClick={() => handleVoteClick(election.id)}
                  >
                    <MdHowToVote size={20} style={{ marginRight: "0px" }} />
                    Cast Vote
                  </button>
                )
              }

            </div>

          </div>

        ))}

      </div>

      {/* PAGINATION */}
      <div className="d-flex justify-content-center mt-4">

        <button
          className="btn btn-outline-primary me-2"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>

        <span className="align-self-center">
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="btn btn-outline-primary ms-2"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>

      </div>

    </div>
  );
}