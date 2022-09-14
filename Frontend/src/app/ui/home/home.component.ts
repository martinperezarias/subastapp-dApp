import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ContractService } from 'src/app/services/contract/contract.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  observables: Subscription[] = []
  address: string;
  amount: number;
  direction: any;
  balance: any = 0;
  bidForm: FormGroup;
  noMoreBids: boolean = false;
  maxBetData: any;
  timeleft: number = 30;
  timer!: any;
  loggedWallet: string;

  constructor(private contract: ContractService) {

    this.observables.push(
      this.contract.isInit.subscribe(res => {
        if (res) {
          this.getData();
          this.startTimeout();
        }
      }),
      this.contract.accountsObservable.subscribe(res => {
        if (res) this.loggedWallet = res[0];
      })
    )

    this.bidForm = new FormGroup({
      amount: new FormControl("", [Validators.required]),
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.observables.forEach(o => o.unsubscribe())
    clearInterval(this.timer)
  }

  moreTime(){
    clearInterval(this.timer)
    this.timeleft = this.timeleft + 5
    this.noMoreBids = false;
    this.startTimeout()
  }

  newBet(){
    if (!this.bidForm.valid) return alert('Invalid amount')
    this.amount = this.bidForm.value.amount;
    this.contract.newBet(this.amount).then((r) => {
      console.log(r);
      this.getData();
    })
    .catch((e) => {
      const message = e.message
      alert('ERROR:'+ this.cutedMessage(message));
    });
  }

  getData(){
    this.contract.getMaxBet().then(res => {
      this.maxBetData = res;
    });
  }

  transferOwnerShip(){
    this.contract.transferOwnerShip()
      .then((r) => {
        console.log(r);
        this.getData();
      })
      .catch((e) => {
        const message = e.message
        alert('ERROR:'+ this.cutedMessage(message));
    });
  }

  startTimeout(){
    this.timer = setInterval(() => {
      this.timeleft -= 1
      if(this.timeleft <= 0) {
        clearInterval(this.timer)
        this.noMoreBids = true;
      }
    }, 1000);
  }

  cutedMessage(message: string){
    return JSON.parse(
      message.substring(
        message.indexOf("'")+1,
        message.lastIndexOf("'"))
      )
  }
}
