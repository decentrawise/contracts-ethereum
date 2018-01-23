(function () {
  "use strict";

  // Get the full version of web3.js Ethereum lib
  var Web3 = require('web3');


  // MN8 contracts data
  var mn8 = window.mn8;

  // HTML Elements
  var _eth, _mn8, _thanks, _address, _mn8address, _network, _wfrecipient,
      _wfdata, _wfamount, _wfsend, _ctoperation, _ctsend, _fctoperation,
      _fctsend, _history;

  var refreshInt;

  var accounts;
  var account;

  var history = null;

  var balanceETH = 0, balanceMN8 = 0;

  function getElements() {
    _eth          = document.getElementById('balance-eth');
    _mn8          = document.getElementById('balance-mn8');
    _thanks       = document.getElementById('thanks');
    _address      = document.getElementById('address');
    _mn8address   = document.getElementById('mn8-address');
    _network      = document.getElementById('network');
    _wfrecipient  = document.getElementById('wf-recipient');
    _wfdata       = document.getElementById('wf-data');
    _wfamount     = document.getElementById('wf-amount');
    _wfsend       = document.getElementById('wf-send');
    _ctoperation  = document.getElementById('ct-operation');
    _ctsend       = document.getElementById('ct-send');
    _fctoperation = document.getElementById('fct-operation');
    _fctsend      = document.getElementById('fct-send');
    _history      = document.getElementById('history');
  }

  function setStatus(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  };

  function checkNetwork(callback) {
    var ok = false;
    web3.version.getNetwork((err, netId) => {
      switch(netId) {
        case '1':
          _network.innerHTML = 'Connected to Ethereum network';
          _network.className = '';
          ok = true;
          break;
        case '2':
          _network.innerHTML = 'ATTENTION: connected to Morden test network';
          _network.className = 'warning';
          onTestnet();
          break;
        case '3':
          _network.innerHTML = 'ATTENTION: connected to Ropsten test network';
          _network.className = 'warning';
          onTestnet();
          break;
        case '4':
          _network.innerHTML = 'ATTENTION: connected to Rinkeby test network';
          _network.className = 'warning';
          ok = true;    // TODO: Just for testing
          //onTestnet();
          break;
        default:
          _network.innerHTML = 'ATTENTION: this is an unknown network';
          _network.className = 'warning';
          onTestnet();
      }
      if(ok) {
        // And callback if all good to go
        callback();
      }
    });
  }

  function refreshBalances() {
    // Check current selected account
    account = web3.eth.coinbase;

    // Refresh ETH balance
    web3.eth.getBalance(mn8.addresses.wallet, (err, value) => {
      if(err) {
        console.log(err);
        setStatus("Error getting ETH balance.");
        return;
      }
      if(value !== balanceETH) {
        balanceETH = value;
        _eth.innerHTML = Number(web3.fromWei(value.valueOf(), 'ether')).toFixed(4);
      }
    });

    // Refresh MN8 supply
    mn8.contracts.token.totalSupply((err, value) => {
      if(err) {
        console.log(err);
        setStatus("Error getting MN8 balance.");
        return;
      }
      if(value !== balanceMN8) {
        balanceMN8 = value;
        var bal = Number(web3.fromWei(value.valueOf(), 'ether'));
        _mn8.innerHTML = bal.toFixed(4);
      }
    });

    // Refresh Transaction History
    if(!history) {
      web3.eth.getBlockNumber((err, blockNumber) => {
        if(err) {
          console.log('Error getting last block number:', err);
          return;
        }

        const month = 4 * 60 * 24 * 30;
        var blk = blockNumber - month;
        history = mn8.contracts.wallet.allEvents({fromBlock: blk, toBlock: blockNumber});
        history.watch((err, event) => {
          if(err) {
            console.log('Error getting history events:', err);
            return;
          }

          web3.eth.getBlock(event.blockNumber, (err, block) => {
            var row = _history.insertRow(1);    // Insert a row after headers row
            // timestamp
            const ts = mn8.formatDate(new Date(block.timestamp * 1000));
            row.insertCell(0).innerHTML = ts;
            // type
            const type = event.event;
            row.insertCell(1).innerHTML = type;
            // details
            var details;
            switch(type) {
              case 'Deposit':
                details = '<b>By</b>:' + event.args._from;
                break;
              case 'SingleTransact':
              case 'MultiTransact':
              case 'ConsentTransact':
                details = '<b>By</b>:' + event.args.owner + ' <b>To</b>:' + event.args.to + ' <b>Data</b>:' + event.args.data;
                break;
              case 'ConfirmNeeded':
              case 'ConsentNeeded':
                details = '<b>Op</b>:' + event.args.operation + ' <b>By</b>:' + event.args.initiator + ' <b>To</b>:' + event.args.to + ' <b>Data</b>:' + event.args.data;
                break;
              case 'Confirmation':
                details = '<b>Op</b>:' + event.args.operation + ' <b>By</b>:' + event.args.owner;
                break;
              default:
                details = JSON.stringify(event.args);
            }
            row.insertCell(2).innerHTML = details;
            // amount
            const amount = event.args.value ? Number(web3.fromWei(event.args.value)).toFixed(4) : '';
            var c3 = row.insertCell(3);
            c3.className = 'right';
            c3.innerHTML = amount;
          });
        });
      });
    }

    // Show contract addresses
    _address.innerHTML = mn8.addresses.wallet;
    _mn8address.innerHTML = mn8.addresses.token;
  };

  function withdrawFunds(e) {
    e.preventDefault();

    var recipient = _wfrecipient.value;
    var data = _wfdata.value;
    var amount = _wfamount.value;
    var wei = web3.toWei(amount, "ether");

    setStatus("Your transaction has been sent to your wallet. Please confirm it there...");

    // Placeholder for the transaction hash
    var tx = null;

    var singleEvent = mn8.contracts.wallet.SingleTransact();
    singleEvent.watch((err, result) => {
      if(err) {
        setStatus("Some error occurred with the transaction.");
        console.log(err);
        return;
      }

      if(result.transactionHash === tx) {
        clearWatchers(singleEvent, confirmEvent, consentEvent);

        var amount = web3.fromWei(result.args.value);
        setStatus(`Transaction finished. Amount of ${amount} is sent to recipient.`);
      }
    });
    var confirmEvent = mn8.contracts.wallet.ConfirmNeeded();
    confirmEvent.watch((err, result) => {
      if(err) {
        setStatus("Some error occurred with the transaction.");
        console.log(err);
        return;
      }

      if(result.transactionHash === tx) {
        clearWatchers(singleEvent, confirmEvent, consentEvent);

        setStatus("The transaction needs to be confirmed. Operation code is: " + result.args.operation);
      }
    });
    var consentEvent = mn8.contracts.wallet.ConsentNeeded();
    consentEvent.watch((err, result) => {
      if(err) {
        setStatus("Some error occurred with the transaction.");
        console.log(err);
        return;
      }

      if(result.transactionHash === tx) {
        clearWatchers(singleEvent, confirmEvent, consentEvent);

        setStatus("The transaction requires full consent. Operation code is: " + result.args.operation);
      }
    });

    mn8.contracts.wallet.execute(recipient, wei, data, {gas: 400000}, (err, result) => {
      if(err) {
        console.log(err);
        setStatus("Error sending transaction.");
        return;
      }

      tx = result;
      setStatus("Transaction broadcasted to network...");
    });
  }

  function confirmOp(e) {
    e.preventDefault();

    var operation = _ctoperation.value;

    setStatus("Your transaction has been sent to your wallet. Please confirm it there...");

    // Placeholder for the transaction hash
    var tx = null;

    var confirmEvent = mn8.contracts.wallet.Confirmation();
    confirmEvent.watch((err, result) => {
      if(err) {
        setStatus("Some error occurred with the transaction.");
        console.log(err);
        return;
      }

      if(result.transactionHash === tx) {
        clearWatchers(confirmEvent);

        var amount = web3.fromWei(result.args.value);
        setStatus(`Transaction confirmed.`);
      }
    });
    var execEvent = mn8.contracts.wallet.MultiTransact();
    execEvent.watch((err, result) => {
      if(err) {
        setStatus("Some error occurred with the transaction.");
        console.log(err);
        return;
      }

      if(result.transactionHash === tx) {
        clearWatchers(confirmEvent, execEvent);

        var amount = web3.fromWei(result.args.value);
        setStatus(`Transaction approved. Amount of ${amount} is sent to recipient.`);
      }
    });

    mn8.contracts.wallet.confirm(operation, {gas: 100000}, (err, result) => {
      if(err) {
        console.log(err);
        setStatus("Error sending transaction.");
        return;
      }

      tx = result;
      setStatus("Transaction broadcasted to network...");
    });
  }

  function consentOp(e) {
    e.preventDefault();

    var operation = _fctoperation.value;

    setStatus("Your transaction has been sent to your wallet. Please confirm it there...");

    // Placeholder for the transaction hash
    var tx = null;

    var confirmEvent = mn8.contracts.wallet.Confirmation();
    confirmEvent.watch((err, result) => {
      if(err) {
        setStatus("Some error occurred with the transaction.");
        console.log(err);
        return;
      }

      if(result.transactionHash === tx) {
        clearWatchers(confirmEvent);

        var amount = web3.fromWei(result.args.value);
        setStatus(`Transaction confirmed.`);
      }
    });
    var execEvent = mn8.contracts.wallet.ConsentTransact();
    execEvent.watch((err, result) => {
      if(err) {
        setStatus("Some error occurred with the transaction.");
        console.log(err);
        return;
      }

      if(result.transactionHash === tx) {
        clearWatchers(confirmEvent, execEvent);

        var amount = web3.fromWei(result.args.value);
        setStatus(`Transaction fully approved. Amount of ${amount} is sent to recipient.`);
      }
    });

    mn8.contracts.wallet.consent(operation, {gas: 100000}, (err, result) => {
      if(err) {
        console.log(err);
        setStatus("Error sending transaction.");
        return;
      }

      tx = result;
      setStatus("Transaction broadcasted to network...");
    });
  }

  function clearWatchers() {
    const args = Array.from(arguments);
    args.map((event) => {
      event.stopWatching();
    });
  }

  function disableForms(disabled) {
    _wfrecipient.disabled = disabled;
    _wfdata.disabled = disabled;
    _wfamount.disabled = disabled;
    _wfsend.disabled = disabled;
    _ctoperation.disabled = disabled;
    _ctsend.disabled = disabled;
    _fctoperation.disabled = disabled;
    _fctsend.disabled = disabled;
  }

  function noWeb3() {
    disableForms(true);
    _network.innerHTML = 'It seems that you are not using MetaMask or Mist. Using one of these is needed to be able to access Ethereum network.';
  }

  function onTestnet() {
    disableForms(true);
  }

  function showAccount() {
    if(_wfrecipient) _wfrecipient.value = account;
  }

  function online(e) {
    if(navigator.onLine) {
      refreshInt = setInterval(refreshBalances, 1000);
    } else {
      clearInterval(refreshInt);
    }
  }

  function setEvents() {
    _wfsend.addEventListener('click', withdrawFunds);
    _ctsend.addEventListener('click', confirmOp);
    _fctsend.addEventListener('click', consentOp);
    window.addEventListener('online', online);
    window.addEventListener('offline', online);
    online();
  }

  window.onload = function() {
    // Get the references to HTML Elements
    getElements();

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if(typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      window.web3 = new Web3(web3.currentProvider);
    } else if(typeof Web3 !== 'undefined') {
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    } else {
      // No Web3 available
      noWeb3();
      return;
    }

    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        setStatus("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        setStatus("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
      web3.eth.defaultAccount = account;    // Important for not having invalid address when calling contracts

      // Show current account selected in form fields
      showAccount();

      checkNetwork(() => {
        // Initialize MN8 contracts
        mn8.init();

        // Set event handlers and pollings
        setEvents();

        refreshBalances();
      });
    });
  }

})();
