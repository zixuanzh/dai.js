import OasisExchangeService from '../../../src/exchanges/oasis/OasisExchangeService';
import Web3Service from '../../../src/eth/Web3Service';
import tokens from '../../../contracts/tokens';
import { utils } from 'ethers';
import testAccountProvider from '../../../src/utils/TestAccountProvider';
import orderStyle from '../../../src/exchanges/orderStyle';
import contracts from '../../../contracts/contracts';

test('sell Dai for WETH', (done) => setTimeout(() => {
  const oasisExchangeService = OasisExchangeService.buildKovanService();
  let oasisOrder = null;
  oasisExchangeService.manager().authenticate()
    .then(() => {
      oasisOrder = oasisExchangeService.sellDai(utils.parseEther('0.01'), tokens.WETH);
      return oasisOrder._transaction;
    })
    .then(tx => {
      //console.log(tx);
      expect(tx.data.length).toBeGreaterThan(20);
      expect(oasisOrder.type()).toBe('market');
      const fees = oasisOrder.fees();
      //console.log('fees: ', fees);
      return fees;
    })
    .then(minedTx=>{
      //console.log('minedTx:', minedTx);
      done();
    });
},
15000),
30000
);

test('get fees', (done) => setTimeout(() => {
  const oasisExchangeService = OasisExchangeService.buildKovanService();
  let oasisOrder = null;
  oasisExchangeService.manager().authenticate()
    .then(() => {
      oasisOrder = oasisExchangeService.sellDai(utils.parseEther('0.01'), tokens.WETH);
      oasisOrder.state().onCompleted(()=>{
        expect(parseFloat(oasisOrder.fees(),10)).toBeGreaterThan(0);
        done();
      });
    });
},
15000),
30000
);

/*
test.only('transaction state machine works', (done) => setTimeout(() => {
  const oasisExchangeService = OasisExchangeService.buildKovanService();
  let oasisOrder = null;
  oasisExchangeService.manager().authenticate()
    .then(() => {
      oasisOrder = oasisExchangeService.sellDai(utils.parseEther('0.01'), tokens.WETH);
      oasisOrder.state().onPending(()=>{
        //expect isPending to be true
      });
      oasisOrder.state().onConfirmed(()=>{
        //expect is confirmed to be true
      });
      oasisOrder.state().onCompleted(()=>{
        //expect is completed to be true
      });
      done()
    });
},
15000),
30000
);
*/

test('get fillAmount sellDai', (done) => setTimeout(() => {
  const oasisExchangeService = OasisExchangeService.buildKovanService();
  let oasisOrder = null;
  oasisExchangeService.manager().authenticate()
    .then(() => {
      oasisOrder = oasisExchangeService.sellDai(utils.parseEther('0.01'), tokens.WETH);
      oasisOrder.state().onCompleted(()=>{
        expect(parseFloat(oasisOrder.fillAmount(),10)).toBeGreaterThan(0);
        done();
      });
    });
},
15000),
30000
);

/*test('get fillAmount buyDai', (done) => setTimeout(() => {
  const oasisExchangeService = OasisExchangeService.buildKovanService();
  let oasisOrder = null;
  oasisExchangeService.manager().authenticate()
    .then(() => {
      oasisOrder = oasisExchangeService.buyDai(utils.parseEther('0.01'), tokens.WETH);
      console.log('oasisOrder: ', oasisOrder);
      return oasisOrder.fillAmount();
    })
    .then(fillAmount => {
      console.log('fillAmount (buy Dai): ', fillAmount);
      done();
    });
},
15000),
30000
);*/

test('buy Dai with WETH', (done) => setTimeout(() => {
  const oasisExchangeService = OasisExchangeService.buildKovanService();
  let oasisOrder = null;
  oasisExchangeService.manager().authenticate()
    .then(()=>{
      const wethToken = oasisExchangeService.get('ethereumToken').getToken(tokens.WETH);
      return wethToken.approveUnlimited(oasisExchangeService.get('smartContract').getContractByName(contracts.MAKER_OTC).address);
    })
    .then(tx => {
      //console.log('weth approval tx:', tx);
      oasisOrder = oasisExchangeService.buyDai(utils.parseEther('0.01'), tokens.WETH);
      return oasisOrder._transaction;
    })
    .then(tx => {
      //console.log(tx);
      expect(tx.data.length).toBeGreaterThan(20);
      expect(oasisOrder.type()).toBe('market');
      done();
    });
},
15000),
30000
);

/*
test('test keccak', (done) => setTimeout(() => {
  const oasisExchangeService = OasisExchangeService.buildKovanService();
  let oasisOrder = null;
  oasisExchangeService.manager().authenticate()
    .then(()=>{
      //const string = 'LogTrade(uint256,address,uint256,address)';
      const string = 'LogTake(bytes32,bytes32,address,address,address,address,uint128,uint128,uint64)';
      const hex = oasisExchangeService.get('web3')._web3.toHex(string);
        console.log(utils.keccak256(hex));
      done();
    });
},
1000),
3000
);*/


/*
test('sell Dai on testnet', (done) => setTimeout(() => {
  const oasisExchangeService = OasisExchangeService.buildTestService();
  let oasisOrder = null;
  oasisExchangeService.manager().authenticate()
    .then(()=>{
      //acquire some DAI
    })
    .then(()=>{
      const daiToken = oasisExchangeService.get('ethereumToken').getToken(tokens.DAI);
      return daiToken.approveUnlimited(oasisExchangeService.get('smartContract').getContractByName(contracts.MAKER_OTC).address);
    })
    .then(tx => {
      //console.log('dai approval tx:', tx);
      done();
      //oasisOrder = oasisExchangeService.sellDai(utils.parseEther('0.1'), tokens.WETH);
      //return oasisOrder._transaction;
    });

    /*
    .then(tx => {
      //console.log(tx);
      expect(tx.data.length).toBeGreaterThan(20);
      expect(oasisOrder.type()).toBe('market');
      done();
    });
},
2000),
4000
);
*/


/*
attempting to create limit order on testnet, not working
test.only('create buy order on testnet', (done) => setTimeout(() => {
    const oasisExchangeService = OasisExchangeService.buildTestService();
    let oasisOrder = null;
    oasisExchangeService.manager().authenticate()
      .then(()=> {
        const ethToken = oasisExchangeService.get('ethereumToken').getToken(tokens.ETH);
        return ethToken.balanceOf(oasisExchangeService.get('web3').ethersSigner().address);
      })
      .then((balance) => {
        console.log('balance: ', balance.toString());
        const ethereumTokenService = oasisExchangeService.get('ethereumToken');
        const wethToken = ethereumTokenService.getToken(tokens.WETH);
        wethToken.deposit(utils.parseEther('2.0'));
        const oasisContract = oasisExchangeService.get('smartContract').getContractByName(contracts.MAKER_OTC);
        wethToken.approveUnlimited(oasisContract.address);
        const wethAddress = wethToken.address();
        const daiAddress = ethereumTokenService.getToken(tokens.DAI).address();
        var overrideOptions = { gasLimit: 5000000};
        oasisOrder = oasisExchangeService.offer(utils.parseEther('1.0'), wethAddress, utils.parseEther('10.0'), daiAddress, 0, false, overrideOptions);
        return oasisOrder._transaction;
      })
      .then(tx => {
        console.log(tx);
        expect(tx.data.length).toBeGreaterThan(20);
        expect(oasisOrder.type()).toBe('market');
        done();
      });
  },
  15000),
  30000

);*/