import React from "react";
import "./style.scss";

function ResolvedBids({ wins, loses, errors }) {
  return (
    <div className="resolved-bids-wrapper">
      <p>Resolved Bids</p>
      <p>Wins {wins}</p>
      <p>Loses {loses}</p>
      <p>Errors {errors}</p>
    </div>
  );
}

export default ResolvedBids;
