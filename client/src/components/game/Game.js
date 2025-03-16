import React from "react";
import "./Game.css";

const Game = ({ score, loading, ranking, handleCardClick, error }) => {
  return (
    <div className="game">
      <h2>
        Your Score: <span>{loading ? "Loading..." : score}</span>
      </h2>
      {ranking && (
        <div className="ranking">
          Rank: <span>#{ranking.ranking}</span> of {ranking.totalUsers} (Top {ranking.percentile}%)
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>Click the button below to update your score randomly</p>

      <button
        onClick={handleCardClick}
        style={{
          padding: "20px",
          fontSize: "18px",
          cursor: "pointer",
        }}
        disabled={loading}
      >
        🎲 Click Me (Random +/- Score)
      </button>
    </div>
  );
};

export default Game;
