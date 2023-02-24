import React from "react";

const LeaderboardItem = ({ item, place }) => {
  return (
    <li className="leaderboard-results__item">
      <p>{place}</p>
      <p>
        {item.user1.name} & {item.user2.name}
      </p>
      <p>{item.points}</p>
    </li>
  );
};

export default LeaderboardItem;
