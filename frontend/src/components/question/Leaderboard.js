import React, { useState } from "react";
import Leaderboarditem from "./LeaderboardItem";

const Leaderboard = () => {
  const [results, setResults] = useState([
    { user1: { name: "Jason" }, user2: { name: "Jess" }, points: 10 },
  ]);
  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <ul className="leaderboard-results">
        {results.map((result, idx) => (
          <Leaderboarditem place={idx + 1} item={result} />
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
