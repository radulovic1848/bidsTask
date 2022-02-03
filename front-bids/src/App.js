import "./App.css";
import React, { useEffect, useState } from "react";
import Dropdown from "./components/Dropdown/Dropdown";
import { getCampaigns } from "./api/campaignsApi";
import PendingBids from "./components/PendingBids/PendingBides";
import ResolvedBids from "./components/ResolvedBids/ResolvedBids";
import { getNewBids } from "./api/newBidsApi";
import { ReactQueryDevtools } from "react-query/devtools";
import { useQuery } from "react-query";

function App() {
  const [campaign, setCampaign] = useState("");
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [allBidsArray, setAllBidsArray] = useState([]);
  const [wins, setWins] = useState(0);
  const [error, setError] = useState(0);
  const [loses, setLoses] = useState(0);

  useQuery(["getNewBids"], getNewBids, {
    refetchInterval: 1000,
    onSuccess: (data) => {
      if (campaign !== "") {
        const currentTime = new Date().getTime();
        let transformedArray = [];
        for (let key of Object.keys(data)) {
          const object = {
            id: key,
            time: currentTime,
            timeToShow: new Date(currentTime).toString(),
            ...data[key],
          };
          transformedArray.push(object);
        }
        let array = allBidsArray.concat(transformedArray);
        setAllBidsArray(array);
      }
    },
  });

  function removeResolvedBid(id) {
    const object = allBidsArray.find((item) => {
      return item.id === id;
    });
    if (object.status === 0 || object.status === 1) {
      setError((prevState) => prevState + 1);
    }
    if (object.status === 2) {
      setLoses((prevState) => prevState + 1);
    }
    if (object.status === 3) {
      setWins((prevState) => prevState + 1);
    }
    const newArray = allBidsArray.filter((bid) => {
      return bid.id !== id;
    });
    setAllBidsArray(newArray);
  }

  function dropdownValueHandler(event) {
    setCampaign(event.target.value);
  }

  useEffect(() => {
    getCampaigns().then((response) => {
      setAllCampaigns(response);
    });
  }, []);

  return (
    <>
      <div className="App">
        <h1 className="main-header">Bigabid Banker</h1>
        <Dropdown
          values={allCampaigns}
          onChange={dropdownValueHandler}
        ></Dropdown>
        {campaign === "" ? (
          <p>There is no campaign selected</p>
        ) : (
          <p>Selected campaign: {campaign}</p>
        )}
        <div className="bid-components-wrapper">
          <PendingBids
            bids={allBidsArray}
            removeBidFromParent={removeResolvedBid}
          ></PendingBids>
          <ResolvedBids wins={wins} loses={loses} errors={error}></ResolvedBids>
        </div>
      </div>
      <ReactQueryDevtools />
    </>
  );
}

export default App;
