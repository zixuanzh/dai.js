import EthereumCdpService from '../../src/eth/EthereumCdpService';
import Cdp from '../../src/eth/Cdp';
import tokens from '../../contracts/tokens';
//import contracts from '../../contracts/contracts';

let createdCdpService;

beforeAll(() => {
  return createdCdpService = EthereumCdpService.buildTestService();
});

test('should open a new CDP and return its ID', done => {
  createdCdpService.manager().authenticate()
  .then(() => {
    const newCdp = new Cdp(createdCdpService);
    newCdp.getCdpId().then(id => {
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
      done();
    });
  });
});

test('should create a cdp object with an authenticated service and a cdp id', done => {
  createdCdpService.manager().authenticate()
    .then(() => {
      createdCdpService.openCdp()
      .onMined()
      .then(cdp => {
        expect(cdp).toBeDefined();
        expect(cdp._cdpService).toBeDefined();
        expect(cdp._smartContractService).toBeDefined();
        return cdp.getCdpId();
      })
      .then(id => {
        expect(id).toBeGreaterThan(0);
        done();
      });
    });
}, 5000);

test('should be able to get a CDP\'s info', done => {
  createdCdpService.manager().authenticate()
    .then(() => {
      createdCdpService.openCdp()
      .onMined()
      .then(cdp => {
        cdp.getInfo().then(info => {
          expect(info).toBeDefined();
          expect(typeof info).toBe('object');
          done();
        });
      });
    });
}, 5000);

test('should be able to close a CDP', done => {
  createdCdpService.manager().authenticate()
  .then(() => createdCdpService.openCdp())
  .then(txn => txn.onMined())
  .then(cdp => cdp.shut())
  .then(txn => txn.onMined())
  .then(cdpId => createdCdpService.getCdpInfo(cdpId))
  .then(info => {
    expect(info.lad).toBe('0x0000000000000000000000000000000000000000');
    done();
  });
}, 5000);

test('should be able to lock eth', done => {
  let newCdp;
  let firstBalance;

  createdCdpService.manager().authenticate()
  .then(() => createdCdpService.openCdp().onMined())
  .then(cdp => {
    newCdp = cdp;
    newCdp.getInfo()
    .then(info => firstBalance = parseFloat(info.ink))
    .then(() => newCdp.lockEth('0.1'))
    .then(txn => {
      txn.onMined()
      .then(() => {
        newCdp.getInfo()
        .then(info => {
          expect(parseFloat(info.ink)).toBeCloseTo(firstBalance + 100000000000000000);
          done();
        });
      });
    });
  });
}, 5000);

test('should be able to draw DAI', done => {
  let newCdp, firstInkBalance, firstDaiBalance, defaultAccount;

  createdCdpService.manager().authenticate()
    .then(() => createdCdpService.openCdp().onMined())
    .then(cdp => {
      defaultAccount = createdCdpService.get('token').get('web3').defaultAccount();
      newCdp = cdp;
      return Promise.all([
        newCdp.getInfo(),
        createdCdpService.get('token').getToken(tokens.DAI).balanceOf(defaultAccount)
      ]);
    })
    .then(info => {
      firstInkBalance = parseFloat(info[0].ink);
      firstDaiBalance = parseFloat(info[1].toString());
      return newCdp.lockEth('0.1').then(txn => txn.onMined());
    })

    //.then(() => createdCdpService.get('smartContract').getContractState(contracts.SAI_TUB, 5, true, []))
    //.then(tub => console.log(tub))

    .then(() => newCdp.getInfo())
    .then(info => {
      expect(parseFloat(info.ink)).toBeCloseTo(firstInkBalance + 100000000000000000);
      return newCdp.drawDai('1').then(txn => txn.onMined());
    })
    .then(() => Promise.all([
      newCdp.getInfo(),
      createdCdpService.get('token').getToken(tokens.DAI).balanceOf(defaultAccount)
    ]))
    .then(result => {
      expect(parseFloat(result[1].toString())).toBeCloseTo(firstDaiBalance + 1.0);
      done();
    })
    .catch(reason => {
      done.fail();
      throw reason;
    });

}, 5000);