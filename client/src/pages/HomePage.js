"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import getSmileyGif from "../components/getSmileyGif";
import Game from "../components/game/Game";
import Leaderboard from "../components/leaderboard/Leaderboard";

const HomePage = () => {
  const { user, token, logout } = useAuth();
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [ranking, setRanking] = useState(null);
  const [socket, setSocket] = useState(null);

  const navigate = useNavigate();

  const getUsernameFromEmail = (email) => {
    return email ? email.split("@")[0] : "Unknown"
  }

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5001")

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id)
    })

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })

    setSocket(newSocket)

    return () => {
      console.log("Disconnecting socket")
      newSocket.disconnect()
    }
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return

    // Listen for leaderboard updates
    socket.on("leaderboard-update", (data) => {
      setLeaderboard(data.leaderboard || [])

      // When leaderboard updates, also update the user's ranking
      if (token) {
        fetchRanking()
      }
    })

    return () => {
      socket.off("leaderboard-update")
    }
  }, [socket, token]);

  const handleLogout = () => {
    logout()
    navigate("/login") // Redirect to login page
  }

  // Fetch user score
  useEffect(() => {
    const fetchScore = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const res = await axios.get("http://localhost:5001/api/auth/score", {
          headers: { Authorization: `Bearer ${token}` },
        })

        setScore(res.data.score)
        setLoading(false)
      } catch (error) {
        console.error("Score fetch error:", error.response?.data || error.message)
        setError(error.response?.data?.msg || "Failed to fetch score")
        setLoading(false)
      }
    }

    fetchScore()
  }, [token]);

  // Fetch leaderboard initially
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/auth/leaderboard?limit=10")
        setLeaderboard(res.data.leaderboard || [])
      } catch (error) {
        console.error("Leaderboard fetch error:", error.response?.data || error.message)
      }
    }

    fetchLeaderboard();
  }, []);

  // Fetch player ranking
  const fetchRanking = async () => {
    if (!token) return;

    try {
      console.log("Fetching ranking data")
      const res = await axios.get("http://localhost:5001/api/auth/ranking", {
        headers: { Authorization: `Bearer ${token}` },
      })

      setRanking(res.data)

    } catch (error) {
      console.error("Ranking fetch error:", error.response?.data || error.message)
    }
  }

  // Fetch player ranking initially
  useEffect(() => {
    if (token) {
      fetchRanking()
    }
  }, [token]);

  const handleCardClick = async () => {
    if (!token) return;

    const change = Math.floor(Math.random() * 10) - 5;

    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/score",
        { change },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setScore(res.data.newScore)

    } catch (err) {
      console.error("Score update error:", err.response?.data || err.message)
      setError(err.response?.data?.msg || "Failed to update score")
    }
  }

  return (
    <>
      <section className="header">
        <h1>
          Welcome back <span>{user ? getUsernameFromEmail(user.email) : "Guest"}</span>{" "}
        </h1>
        <button onClick={handleLogout}>Logout</button>
      </section>

      <section className="content">
        
        <Leaderboard
          leaderboard={leaderboard}
          user={user}
          getUsernameFromEmail={getUsernameFromEmail}
        />

        <div className="main">
          <img
            src={getSmileyGif(ranking?.ranking) || null}
            alt="Smiley"
            style={{
              width: "10rem",
              height: "10rem"
            }}
          />

          <Game
            score={score}
            loading={loading}
            ranking={ranking}
            handleCardClick={handleCardClick}
            error={error}
          />
        </div>

      </section>
    </>
  )
}

export default HomePage;
