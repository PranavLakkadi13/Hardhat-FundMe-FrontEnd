import { ethers } from "./ethers-5.6.esm.min.js";
import { abi,contractAddress } from "./constants.js";

const connectButton = document.getElementById("ConnectButton");
const fundButton = document.getElementById("FundButton");
const balanceButton = document.getElementById("BalanceButton");
const withdrawButton = document.getElementById("WithdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

console.log(ethers);

// This part of the code is to connect metamask to the website 
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("There is metamask installed in your browser");
        // the method below is according to the metamask docs 
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("Metamask has been connected");
        connectButton.innerHTML = "Connected!!!";
    }
    else {
        console.log("No Metamask, pls install it ");
        connectButton.innerHTML = "Pls install Metamask"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = await new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(`the balance is ${ethers.utils.formatEther(balance)}`);
    }
}

async function fund() {
    const EthAmount = document.getElementById("EthAmount").value;
    console.log(`funding with ${EthAmount}`);
    if (typeof window.ethereum !== "undefined") {
        /* * list of things needed to fund 
         * provider / connection to the blockchain 
         * signer / wallet 
         * contract to interact with 
         * contract ABI & address
         */
        const provider = await new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = await new ethers.Contract(contractAddress,abi,signer);
        try {
            const transactionResponse = await contract.fund({ value: ethers.utils.parseEther(EthAmount)});
            // we are waiting for an event to finish 
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done");
        }
        catch (error) {
            console.log(error);
        }
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing.......")
        const provider = await new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.withdraw();
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done");
        }
        catch (error) {
            console.log(error)
        }
    }
}

// here we are waiting to get the transaction receipt to finish 
function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining : ${transactionResponse.hash} ......`);
    //listen for this transaction to finish 
    return new Promise((resolve, reject) => {
        try {
            // the listener will catch the event as soon as it is fired but only once
            provider.once(transactionResponse.hash, (transactionReceipt) => {
          console.log(
            `Completed with ${transactionReceipt.confirmations} confirmations`
          );
            resolve();
        });
        }
        catch (error) {
            reject(error);
        }
    })
}