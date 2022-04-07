import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import "./App.css";
var ethUtil = require('ethereumjs-util');
var sigUtil = require('eth-sig-util');

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null, cid: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;
    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();
    console.log('-----------------r1: ', response);
    const response2 = await contract.methods.chainidd().call();
    console.log('-----------------r2: ', response2);

    // Update state with the result.
    this.setState({ storageValue: response, cid: response2 });
  };

  signData = async () => {
    const { web3, accounts, contract, cid } = this.state;
    var signer = accounts[0];
    var deadline = Date.now() + 100000;
    console.log('------------deallinee: ', deadline);
    console.log('-----------------r1: ', cid);
    var x = 16;

    web3.currentProvider.sendAsync({
      method: 'net_version',
      params: [],
      jsonrpc: "2.0"
    }, function (err, result) {
      console.log("-----------------c0")
      const netId = result.result;
      console.log("-----------------c0.1: ", netId)
      console.log("netId", netId);
      const msgParams = JSON.stringify({types:
        {
        EIP712Domain:[
          {name:"name",type:"string"},
          {name:"version",type:"string"},
          {name:"chainId",type:"uint256"},
          {name:"verifyingContract",type:"address"}
        ],
        set:[
          {name:"sender",type:"address"},
          {name:"x",type:"uint"},
          {name:"deadline", type:"uint"}
        ]
      },
      //make sure to replace verifyingContract with address of deployed contract
      primaryType:"set",
      domain:{name:"SetTest",version:"1",chainId:netId,verifyingContract:"0xBB8D2f2204720283551bd816E76E7142A1457bE2"},
      message:{
        sender: signer,
        x: x,
        deadline: deadline
      }
      })

      var from = signer;
    
      console.log('CLICKED, SENDING PERSONAL SIGN REQ', 'from', from, msgParams)
      var params = [from, msgParams]
      console.dir(params)
      var method = 'eth_signTypedData_v3'
    
      console.log('----------------c2')
      web3.currentProvider.sendAsync({
        method,
        params,
        from,
      }, async function (err, result) {
        if (err) return console.dir(err)
        if (result.error) {
          console.error('ERROR1', result)
          alert(result.error.message)
        }
        if (result.error) return console.error('ERROR2', result)
        console.log('TYPED SIGNED:' + JSON.stringify(result.result))
        console.log("----------1: ", Object.keys(result), '--------' )
    
        const recovered = sigUtil.recoverTypedSignature({ data: JSON.parse(msgParams), sig: result.result })
    
        if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)) {
          alert('Successfully ecRecovered signer as ' + from)
        } else {
          alert('Failed to verify signer when comparing ' + result + ' to ' + from)
        }

        //getting r s v from a signature
        const signature = result.result.substring(2);
        const r = "0x" + signature.substring(0, 64);
        const s = "0x" + signature.substring(64, 128);
        const v = parseInt(signature.substring(128, 130), 16);
        console.log("r:", r);
        console.log("s:", s);
        console.log("v:", v);

        console.log("---------c2.5: ", accounts[0])
        let res = await contract.methods.executeSetIfSignatureMatch(v,r,s,signer, deadline, x).send({ from: accounts[0] });
        console.log("---------c3: ", res)
      }) 
    })
  }
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h2>EIP 712 Example</h2>
        <p>
          Try changing the value stored on <strong>line 51</strong> of App.js.
        </p>
        <div>The stored value is: {this.state.storageValue}</div>
        <button onClick={() => this.signData()}> Press to sign </button>
      </div>
    );
  }
}

export default App;
