import { Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Web3 from 'web3';

const AuctionJSON = require('../../../../../Blockchain/build/contracts/Auction.json');
declare let require: any;
declare let window: any;

let web3;
let auction;

@Injectable({
  providedIn: 'root'
})

export class ContractService {
  public accountsObservable = new BehaviorSubject([]);
  public isInit = new BehaviorSubject(false);
  accounts;

  constructor() {
    this.initWeb3()
      .then(_web3 => {      
        web3 = _web3;
        auction = this.initContract();
        this.isInit.next(true);
        web3.eth.getAccounts()
          .then(_accounts => {
            this.accounts = _accounts;
            this.accountsObservable.next(this.accounts);
          })
      })
      .catch(e => console.log(e.message));
  }

  initContract () {
    const deploymentKey = Object.keys(AuctionJSON.networks)[0];
    return new web3.eth.Contract(
      AuctionJSON.abi, 
      AuctionJSON
        .networks[deploymentKey]
        .address
    );
  };

  initWeb3() {
    return new Promise((resolve, reject) => {
      if(typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        window.ethereum.enable()
          .then(() => {
            resolve(
              new Web3(window.ethereum)
            );
          })
          .catch(e => {
            reject(e);
          });
        return;
      }
      if(typeof window.web3 !== 'undefined') {
        return resolve(
          new Web3(window.web3.currentProvider)
        );
      }
      resolve(new Web3('http://127.0.0.1:7545/'));
    });
  };

  newBet(amount){
    return new Promise((resolve, reject) => {
      auction.methods.newBet(amount).send({from: this.accounts[0]})
        .then((res) => {
          return resolve(res);
        }).catch((error) => {
          return reject(error);
        });
    })
  }

  getMaxBet(): Promise<any>{
    return new Promise((resolve, reject) => {
      auction.methods.getCurrentMax().call()
        .then(res => {
          let response = {
            winnerAddress: res[0],
            currentOwner: res[1],
            amount: res[2],
            bids: res[3]
          }
          return resolve(response);
        }).catch((error) => {
          return reject(error);
        });
    })
  }

  transferOwnerShip(): Promise<any>{
    return new Promise((resolve, reject) => {
      auction.methods.finishAuction().send({from: this.accounts[0]})
        .then(res => {
          return resolve(res);
        }).catch((error) => {
          return reject(error);
        });
    })
  }

}
