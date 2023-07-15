import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import atm_abi from '../artifacts/contracts/Assessment.sol/Assessment.json';

const HomePage = () => {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [amount, setAmount] = useState(0);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState(0);

  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: 'eth_accounts' });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log('Account connected: ', accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log('No account found');
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

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
      const balance = await atm.getBalance();
      setBalance(balance.toNumber());
    }
  };

  const handleDeposit = async () => {
    if (atm && amount > 0) {
      const tx = await atm.deposit(amount);
      await tx.wait();
      getBalance();
    }
  };

  const handleWithdraw = async () => {
    if (atm && amount > 0) {
      const tx = await atm.withdraw(amount);
      await tx.wait();
      getBalance();
    }
  };

  const handleForce100 = async () => {
    if (!atm) return;

    try {
      const tx = await atm.deposit(100);
      await tx.wait();
      getBalance();
    } catch (error) {
      console.error('Force 100 Error:', error);
    }
  };

  const handleRevertBalance = async () => {
    if (!atm) return;

    try {
      const tx = await atm.withdraw(balance-amount);
      await tx.wait();
      getBalance();
    } catch (error) {
      console.error('Revert Balance Error:', error);
    }
  };

  const getRecipientBalance = async (recipient) => {
    if (!atm) return;

    try {
      const recipientBalance = await atm.userBalances(recipient);
      console.log('Recipient Balance:', recipientBalance.toNumber());
    } catch (error) {
      console.error('Error fetching recipient balance:', error);
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return (
        <button onClick={connectAccount}>Please connect your Metamask wallet</button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <><div className="user-container">
        <p className="account-info">Your Account: {account}</p>
        <p className="account-info">Your Balance: {balance}</p>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value))}
          className="amount-input"
        />
        <br />
        <button onClick={handleDeposit} className="action-button1">
          Deposit
        </button>
        <button onClick={handleWithdraw} className="action-button2">
          Withdraw
        </button>
      </div>
      <br />
        <div>
        <button onClick={handleRevertBalance} className="action-button3">
          Revert Balance
        </button>
        <br />
          <button onClick={handleForce100} className="action-button4">
            Force 100
          </button>
        </div></>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
    </main>
  );
};

export default HomePage;
