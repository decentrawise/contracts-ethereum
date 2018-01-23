(function () {
  "use strict";


  // MN8 contracts data
  var mn8 = window.mn8;

  // HTML Elements
  var _eth, _mn8, _thanks, _account, _amount, _send, _get, _network, _instructions, _saleaccount, _limit, _hash;

  var refreshInt;

  var accounts;
  var account;

  var balanceETH = 0, balanceMN8 = 0;

  var limitKYC = 0;

  function getElements() {
    _eth          = document.getElementById('balance-eth');
    _mn8          = document.getElementById('balance-mn8');
    _thanks       = document.getElementById('thanks');
    _account      = document.getElementById('account');
    _amount       = document.getElementById('amount');
    _send         = document.getElementById('send');
    _get          = document.getElementById('get');
    _network      = document.getElementById('network');
    _instructions = document.getElementById('instructions');
    _saleaccount  = document.getElementById('sale-account');
    _limit        = document.getElementById('limit');
    _hash         = document.getElementById('hash');
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
    web3.eth.getBalance(account, (err, value) => {
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
    mn8.contracts.token.balanceOf(account, (err, value) => {
      if(err) {
        console.log(err);
        setStatus("Error getting MN8 balance.");
      }
      if(value !== balanceMN8) {
        balanceMN8 = value;
        var bal = Number(web3.fromWei(value.valueOf(), 'ether'));
        _mn8.innerHTML = bal.toFixed(4);
      }

      // Refresh thanks message
      _thanks.className = bal > 0 ? '' : 'hidden';
    });

    // Refresh ETH limit for KYC
    mn8.contracts.crowdsale.weiKYCthreshold((err, value) => {
      if(err) {
        console.log(err);
        setStatus("Error getting KYC threshold.");
      }

      const limit = Number(web3.fromWei(value.valueOf(), 'ether'));
      if(limit !== limitKYC) {
        limitKYC = limit;
        _limit.innerHTML = limit.toFixed(4);
      }
    });

    // Show account address
    _account.innerHTML = account;
  };

  function sendCoin(e) {
    e.preventDefault();

    var amount = parseFloat(document.getElementById("amount").value);
    var wei = web3.toWei(amount, "ether");

    setStatus("Your transaction has been sent to your wallet. Please confirm it there...");
    var purchaseEvent = mn8.contracts.crowdsale.TokenPurchase({purchaser: account});
    purchaseEvent.watch((err, result) => {
      if(!err) {
        setStatus("You received your MN8 tokens. Thank you for your contribution.");
      } else {
        setStatus("Some error occurred with the transaction.");
        console.log(err);
      }
    });

    if(amount > limitKYC) {
      // ... go through KYC process...

      const kycCode = generateKYCCode(account);
      mn8.contracts.crowdsale.buyTokensKYC(account, kycCode, {from: account, value: wei}, (err, result) => {
        if(err) {
          console.log(err);
          setStatus("Error sending transaction.");
          return;
        }
        setStatus("Transaction with KYC sent. Your MN8 are on their way, thank you!");
      });
    } else {
      web3.eth.sendTransaction({from: account, to: mn8.addresses.crowdsale, value: wei}, (err, result) => {
        if(err) {
          console.log(err);
          setStatus("Error sending transaction.");
          return;
        }
        setStatus("Transaction sent. Your MN8 are on their way, thank you!");
      });
    }
  };

  function getCode(e) {
    e.preventDefault();

    var address = document.getElementById("address").value;

    const code = generateKYCCode(address);

    _hash.innerHTML = code;
  }

  function generateKYCCode(address) {
    const hex = address.replace(/^0x/, '').toLowerCase();
    return web3.sha3(web3.toHex('MN8') + hex, {encoding: 'hex'});
  }

  function noWeb3() {
    document.getElementById('ether').style.visibility = 'hidden';
    document.getElementById('amount').disabled = true;
    document.getElementById('send').disabled = true;
    document.getElementById('network').innerHTML = 'It seems that you are not using MetaMask or Mist. Using one of these is highly recommended.';
    document.getElementById('instructions').innerHTML = 'If using MetaMask, Mist or any Web3 enabled wallet, you could simply send the amount of Ether you want to invest in this form...';
  }

  function onTestnet() {
    document.getElementById('amount').disabled = true;
    document.getElementById('send').disabled = true;
    document.getElementById('instructions').innerHTML = 'You are connected to a test network on your wallet. MN8 tokens are only available on the Ethereum main network. Please change the network on your wallet to be able to continue...';
  }

  function showAccount() {
    if(_saleaccount) _saleaccount.innerHTML = mn8.addresses.crowdsale;
  }

  function online(e) {
    if(navigator.onLine) {
      refreshInt = setInterval(refreshBalances, 1000);
    } else {
      clearInterval(refreshInt);
    }
  }

  function setEvents() {
    _send.addEventListener('click', sendCoin);
    _get.addEventListener('click', getCode);
    window.addEventListener('online', online);
    window.addEventListener('offline', online);
    online();
  }

  window.onload = function() {
    // Get the references to HTML Elements
    getElements();

    // Put the correct crowdsale account visible
    showAccount();

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
