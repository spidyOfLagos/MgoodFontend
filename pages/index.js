import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [newOwner, setNewOwner] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const transfer = async () => {
    if (atm && transferTo && transferAmount) {
      // Convert user input to BigNumber
      const transferAmountInWei = ethers.BigNumber.from(transferAmount);
      let tx = await atm.transferFund(transferTo, {
        value: transferAmountInWei,
      });
      await tx.wait();
      getBalance();
      setTransferAmount("");
    } else {
      console.error("Please enter both transfer amount and address.");
    }
  };

  const transferOwnership = async () => {
    if (atm) {
      let tx = await atm.transferOwner(newOwner);
      await tx.wait();
      setNewOwner("");
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this Spidy dapp</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet Spidy sied so
        </button>
      );
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div className="form_wrapper">
        <div className="form_contenr-holder">
          <div className="form_content">
            <p className="label">Balance of the user:</p>
            <p className="value">{balance}</p>
          </div>
          <div className="form_content">
            <p className="label">user Account on:</p>
            <p className="value">{account}</p>
          </div>
        </div>

        <div className="button_control">
          <button onClick={deposit}>Deposit</button>
          <button onClick={withdraw}>Withdraw</button>
        </div>

        <div className="form_control">
          <label>Amount to transfer in ETH</label>
          <input
            placeholder="Enter amount"
            type="number"
            onChange={(e) => setTransferAmount(e.target.value)}
            value={transferAmount}
          />
        </div>

        <div className="form_control">
          <label>Account to transfer to</label>
          <input
            placeholder="Enter address"
            type="text"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
          />
        </div>

        <button onClick={transfer}>Transfer</button>

        <hr />

        <div className="form_control">
          <label>New owner address</label>
          <input
            placeholder="Enter new owner address"
            text="text"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
          />
        </div>

        <button onClick={transferOwnership}>Transfer Ownership</button>
        <style jsx>
          {`
            .form_wrapper {
              max-width: 860px;
              width: 100%;
              background-color: black;
              padding: 20px;
              border-radius: 5px;
              display: flex;
              flex-direction: column;
              // align-items: start;
              color:  white;
            }

            .form_contenr-holder{
              display: flex;
              flex-direction: column;
            } 
            
            .form_contenr-holder .form_content {
              display: flex;
              flex-direction: column;
            }

            .form_content .label {
              font-size: 17px;
              font-weight: 500;
            }

            .form_content .value {
              font-size: 14px;
              display: -webkit-box;
              -webkit-line-clamp: 1;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }

            .form_wrapper .button_control {
              display: flex;
              align-items: center;
              width: 100%;
              gap: 10px;
            }

            .form_wrapper .form_control {
              display: flex;
              flex-direction: column;
              width: 96%;
              gap: 3px;
              margin: 10px 0;
            }

            .form_control label {
              font-size: 14px;
            }

            .form_control input {
              border: 1px solid #ccc;
              width: 100%;
              border: 1px solid #ccc;
            }

            button,
            input {
              padding: 10px 15px;
              border-radius: 3px;
            }

            button {
              background: red;
              border: none;
              color: white;
            }

            hr {
              border: 1px solid #ccc;
              margin: 20px 0;
              width: 100%;
            }
          `}
        </style>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters Spidy dapp</h1>
      </header>
      {initUser()}
      <style jsx>
        {`
          .container {
            background-color: #f1f1f1;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            height: 100vh;
            font-family: "Inter", sans-serif;
            margin: 0;
            padding: 0;
            border: none;
            ourline: none;
            box-sizing: border-box;
          }
        `}
      </style>
    </main>
  );
}