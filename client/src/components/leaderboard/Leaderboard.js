import React from "react";
import "./Leaderboard.css";
import "../game/Game.css";

const Leaderboard = ({ leaderboard, user, getUsernameFromEmail }) => {
  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      {leaderboard.length === 0 ? (
        <p>No players found</p>
      ) : (
        <table>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th>Rank</th>
              <th style={{ textAlign: "left" }}>Player</th>
              <th>Score</th>
              <th>Prize</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: player.email === user?.email ? "rgb(155, 205, 255)" : "transparent",
                  fontWeight: player.email === user?.email ? "bold" : "normal",
                }}
              >
                <td>#{index + 1}</td>
                <td style={{ textAlign: "left" }}>
                  {getUsernameFromEmail(player.email)}
                  {player.email === user?.email && " (You)"}
                </td>
                <td>{player.score}</td>
                <td>
                  {index + 1 === 1 ? "🥇" : ""}
                  {index + 1 === 2 ? "🥈" : ""}
                  {index + 1 === 3 ? "🥉" : ""}
                  {index + 1 === 4 ? "💰" : ""}
                  {index + 1 === 5 ? "💰" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;
