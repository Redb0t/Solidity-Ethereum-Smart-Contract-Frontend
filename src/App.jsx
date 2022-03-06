import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Input from './Input';
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");
  /**
   * Create a varaible here that holds the contract address after you deploy!
   */
  const contractAddress = "0x148dc203a63f03e836Ff0fA6a245C2FbC20e915d";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
      try{
        const { ethereum } = window;
    
        if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
        } else {
          console.log("We have the ethereum object", ethereum);
        }
        const accounts = await ethereum.request({ method: "eth_accounts" });
  
        if(accounts.length != 0){
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
        }else{
          console.log("Make account");
        }
      }
      catch(err){
        console.log(err);
      }
    }

const getAllWaves = async () => {
  const { ethereum } = window;

  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      const waves = await wavePortalContract.getAllWaves();

      const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        };
      });

      setAllWaves(wavesCleaned);
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * Listen in for emitter events!
 */
useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);
  
  const connectWallet = async () => {  
    try{
      const {ethereum} = window;

      if(!ethereum){
        alert("Get Metamask!");
        // Probably to prevent from any errors below from calling incorrect functs.
        return;
      }

      const account = await ethereum.request({method: "eth_requestAccounts"});
      console.log("Connected to account: " + account[0]);
      setCurrentAccount(account[0]);
      
    }catch(err){
      console.log(err);
    }
  }
  const wave = async () => {
    try {
      const { ethereum } = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
        console.log("Mining txn: " + waveTxn.hash);

        await waveTxn.wait();
        console.log("Finished Mining txn: " + waveTxn.hash);
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      }else{
        console.log("Eth object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
         hello ^-^ 🐛
        </div>

        <div className="bio">
           Connect your Ethereum wallet and wave at me!
        </div>
        
        <div className = "inputBox">
        
        <Input onChange={setMessage}/>
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App