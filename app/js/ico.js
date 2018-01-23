(function () {
  "use strict";


  // Etherscan Transaction URL prefix
  var urlEtherscanTx = 'https://etherscan.io/tx/';

  // MN8 contracts data
  var mn8 = window.mn8;

  // HTML Elements
  var _eth, _mn8, _network, _history;

  var refreshInt;
  var purchaseEvent = null;

  var balanceETH = 0, balanceMN8 = 0;

  function getElements() {
    _eth          = document.getElementById('balance-eth');
    _mn8          = document.getElementById('balance-mn8');
    _network      = document.getElementById('network');
    _history      = document.getElementById('history');
  }

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
          break;
        case '3':
          _network.innerHTML = 'ATTENTION: connected to Ropsten test network';
          _network.className = 'warning';
          break;
        case '4':
          _network.innerHTML = 'ATTENTION: connected to Rinkeby test network';
          _network.className = 'warning';
          ok = true;    // TODO: Just for testing
          urlEtherscanTx = 'https://rinkeby.etherscan.io/tx/'; // TODO: as well
          break;
        default:
          _network.innerHTML = 'ATTENTION: this is an unknown network';
          _network.className = 'warning';
      }
      if(ok) {
        // And callback if all good to go
        callback();
      }
    });
  }

  function refreshBalances() {
    // Refresh ETH balance
    web3.eth.getBalance(mn8.addresses.wallet, (err, value) => {
      if(err) {
        console.log(err);
        setStatus("Error getting ETH balance.");
      }
      if(value !== balanceETH) {
        balanceETH = value;
        _eth.innerHTML = Number(web3.fromWei(value.valueOf(), 'ether')).toFixed(4);
      }
    });

    // Refresh MN8 balance
    mn8.contracts.token.totalSupply((err, value) => {
      if(err) {
        console.log(err);
        setStatus("Error getting MN8 balance.");
      }
      if(value !== balanceMN8) {
        balanceMN8 = value;
        var bal = Number(web3.fromWei(value.valueOf(), 'ether'));
        _mn8.innerHTML = bal.toFixed(4);
      }
    });
  };

  function setupHistoryUpdater() {
    if(purchaseEvent) return;

    purchaseEvent = mn8.contracts.crowdsale.TokenPurchase({}, {fromBlock: 0 });
    purchaseEvent.watch((err, event) => {
      if(err) {
        console.log(err);
      }

      web3.eth.getBlock(event.blockNumber, (err, block) => {
        var row = _history.insertRow(1);    // Insert a row after headers row
        // timestamp
        const ts = mn8.formatDate(new Date(block.timestamp * 1000));
        row.insertCell(0).innerHTML = ts;
        // addresses
        const addresses = '<b>To</b>:' + event.args.beneficiary + ' <b>By</b>:' + event.args.purchaser + ' <b>Tx</b>:<a target="_blank" href="' + urlEtherscanTx + event.transactionHash + '">' + event.transactionHash + '</a>';
        row.insertCell(1).innerHTML = addresses;
        // investment
        const invest = event.args.value ? Number(web3.fromWei(event.args.value)).toFixed(4) : '';
        const c2 = row.insertCell(2);
        c2.className = 'right';
        c2.innerHTML = invest;
        // tokens sent
        const tokens = event.args.amount ? Number(web3.fromWei(event.args.amount)).toFixed(4) : '';
        const c3 = row.insertCell(3);
        c3.className = 'right';
        c3.innerHTML = tokens;
      });
    });
  };

  function clearHistoryUpdater() {
    if(purchaseEvent) {
      purchaseEvent.stopWatching();
      purchaseEvent = null;
    }
  }

  function noWeb3() {
    _network.innerHTML = 'Couldn\'t Ethereum JavaScript API! Please install MetaMask...';
    _network.className = 'warning';
  }

  function online(e) {
    if(navigator.onLine) {
      refreshInt = setInterval(refreshBalances, 1000);
      refreshBalances();
      setupHistoryUpdater();
    } else {
      clearInterval(refreshInt);
      clearHistoryUpdater();
    }
  }

  function setEvents() {
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

    web3.eth.getBlockNumber(function(err, blk) {
      if(err) {
        _network.innerHTML = 'Couldn\'t access to Ethereum network! Please install MetaMask...';
        _network.className = 'warning';
        return;
      }

      checkNetwork(() => {
        // Initialize MN8 contracts
        mn8.init();

        // Set event handlers for on/offline
        setEvents();
      });
    });
  }

})();
