"use client";

import { useState, useEffect } from "react";
import getSmileyGif from "../components/getSmileyGif";
import Game from "../components/game/Game";
import Leaderboard from "../components/leaderboard/Leaderboard";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchUserScore, fetchLeaderboard, fetchRanking, updateScore, updateLeaderboard } from "../redux/scoreSlice";
import { io } from "socket.io-client";

const HomePage = () => {
  const dispatch = useDispatch();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);

  // Get state from Redux store
  const { user, token, score, leaderboard, ranking, loading } = useSelector((state) => state.score);

  // Helper function to get username from email
  const getUsernameFromEmail = (email) => {
    return email ? email.split("@")[0] : "Unknown";
  }

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5001");

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id)
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    });

    setSocket(newSocket);

    return () => {
      console.log("Disconnecting socket")
      newSocket.disconnect();
    }
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for leaderboard updates
    socket.on("leaderboard-update", (data) => {
      dispatch(updateLeaderboard(data.leaderboard || []));

      // When leaderboard updates, also update the user's ranking
      if (token) {
        dispatch(fetchRanking());
      }
    })

    return () => {
      socket.off("leaderboard-update");
    }
  }, [dispatch, socket, token]);

  // Initial data loading
  useEffect(() => {
    if (token) {
      dispatch(fetchUserScore());
      dispatch(fetchRanking());
    }
    dispatch(fetchLeaderboard());
  }, [dispatch, token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  }

  const handleCardClick = () => {
    if (!token) return;

    const change = Math.floor(Math.random() * 10) - 5;
    console.log("Updating score with change:", change);

    dispatch(updateScore(change));
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
          loading={loading.leaderboard}
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
            ranking={ranking}
            handleCardClick={handleCardClick}
            loading={loading.score}
          />
        </div>

      </section>
    </>
  )
}

export default HomePage;
