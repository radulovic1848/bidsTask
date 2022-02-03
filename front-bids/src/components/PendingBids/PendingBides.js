import React, { useEffect } from "react";
import { AutoSizer, Column, Table } from "react-virtualized";
import "react-virtualized/styles.css";
import "./style.scss";

function PendingBids({ bids, removeResolvedBid }) {
  useEffect(() => {
    bids?.forEach((element) => {
      const timestamp = new Date().getTime();
      if (element.time + 60000 < timestamp) {
        removeBid(element.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bids]);

  const removeBid = (id) => {
    removeResolvedBid(id);
  };

  return (
    <div className="pending-bids-wrapper">
      <p>Pending Bids</p>
      <AutoSizer>
        {({ height, width }) => (
          <Table
            width={width}
            height={height}
            headerHeight={39}
            rowHeight={39}
            rowCount={bids.length}
            rowGetter={({ index }) => bids[index]}
          >
            <Column label="Bid id" dataKey="id" width={305} />
            <Column label="Bids time" dataKey="timeToShow" width={212} />
            <Column label="Price" dataKey="price" width={60} />
          </Table>
        )}
      </AutoSizer>
    </div>
  );
}

export default PendingBids;
