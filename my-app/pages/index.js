import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
    // walletConnected keep track of whether the user's wallet is connected or not
    const [walletConnected, setWalletConnected] = useState(false);
    // presaleStarted keeps track of whether the presale has started or not
    const [presaleStarted, setPresaleStarted] = useState(false);
    // presaleEnded keeps track of whether the presale ended
    const [presaleEnded, setPresaleEnded] = useState(false);
    // loading is set to true when we are waiting for a transaction to get mined
    const [loading, setLoading] = useState(false);
    // checks if the currently connected MetaMask wallet is the owner of the contract
    const [isOwner, setIsOwner] = useState(false);
    // tokenIdsMinted keeps track of the number of tokenIds that have been minted
    const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
    // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
    const web3ModalRef = useRef();

    /**
      * presaleMint: Mint an NFT during the presale
      */
    const presaleMint = async () => {
        try {
            // We need a Signer here since this is a 'write' transaction.
            const signer = await getProviderOrSigner(true);
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
            // call the presaleMint from the contract, only whitelisted addresses would be able to mint
            const tx = await nftContract.presaleMint({
                // value signifies the cost of one crypto dev which is "0.01" eth.
                // We are parsing `0.01` string to ether using the utils library from ethers.js
                value: utils.parseEther("0.01"),
            });
            setLoading(true);
            // wait for the transaction to get mined
            await tx.wait();
            setLoading(false);
            window.alert("You successfully minted a Crypto Dev!");
        } catch (err) {
            console.error(err);
        }
    };


    /**
   * publicMint: Mint an NFT after the presale
   */
    const publicMint = async () => {
        try {
            // We need a Signer here since this is a 'write' transaction.
            const signer = await getProviderOrSigner(true);
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
            // call the mint from the contract to mint the Crypto Dev
            const tx = await nftContract.mint({
                // value signifies the cost of one crypto dev which is "0.01" eth.
                // We are parsing `0.01` string to ether using the utils library from ethers.js
                value: utils.parseEther("0.01"),
            });
            setLoading(true);
            // wait for the transaction to get mined
            await tx.wait();
            setLoading(false);
            window.alert("You successfully minted a Crypto Dev!");
        } catch (err) {
            console.error(err);
        }
    };

    /*
    *  connectWallet: Connects the MetaMask wallet
    */
    const connectWallet = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // When used for the first time, it prompts the user to connect their wallet
            await getProviderOrSigner();
            setWalletConnected(true);
        } catch (err) {
            console.error(err);
        }
    };

    /**
   * startPresale: starts the presale for the NFT Collection
   */
    const startPresale = async () => {
        try {
            // We need a Signer here since this is a 'write' transaction.
            const signer = await getProviderOrSigner(true);
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
            // call the startPresale from the contract
            const tx = await nftContract.startPresale();
            setLoading(true);
            // wait for the transaction to get mined
            await tx.wait();
            setLoading(false);
            // set the presale started to true
            await checkIfPresaleStarted();
        } catch (err) {
            console.error(err);
        }
    };

    /**
   * checkIfPresaleStarted: checks if the presale has started by quering the `presaleStarted`
   * variable in the contract
   */
    const checkIfPresaleStarted = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const provider = await getProviderOrSigner();
            // We connect to the Contract using a Provider, so we will only
            // have read-only access to the Contract
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
            // call the presaleStarted from the contract
            const _presaleStarted = await nftContract.presaleStarted();
            if (!_presaleStarted) {
                await getOwner();
            }
            setPresaleStarted(_presaleStarted);
            return _presaleStarted;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

}