import { Component, OnDestroy, OnInit } from '@angular/core';

import { webSocket, WebSocketSubjectConfig } from 'rxjs/webSocket';
import { interval, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';


export interface IWsConfig {
  status: Observable<boolean>;
  on<T>(event: string): Observable<T>;
  send(event: string, data: any): void;
}

export interface ITradeAction {
  trade: '@trade';
  depth: '@depth';
}

export interface ITradeConf {
  pair: string;
  action: '@trade' | '@depth';
}

export interface IBTrade {
  e: '@trade' | '@depth'; // Event type
  E: number; // Event time
  s: string; // Symbol
  t: number; // Trade ID
  p: string; // Price
  q: string; // Quantity
  b: number; // Buyer order ID
  a: number; // Seller order ID
  T: number; // Trade time
  m: boolean; // Is the buyer the market maker?
  M: boolean; // Ignore
}

@Component({
  selector: 'app-bn',
  templateUrl: './bn.component.html',
  styleUrls: ['./bn.component.scss']
})
export class BnComponent implements OnInit, OnDestroy {

  /* параметры */
  private tradePair = 'btcusdt';


  /* вебсокет */
  private readonly ws = 'wss://stream.binance.com:9443/ws/';
  private readonly tradeActions: ITradeAction = { trade: '@trade', depth: '@depth' };

  private websocket$;
  private webSocketConfig: WebSocketSubjectConfig<IBTrade[]>;

  public wsStatusClosed = true;

  // прочее
  public subs$ = new Subject();

  constructor() {}


  public ngOnInit(): void {
    interval(1000)
      .pipe(takeUntil(this.subs$))
      .subscribe(() => {
        this.wsStatusClosed = this.websocket$ ? this.websocket$.closed : true;
      });
  }

  public updateWsConfig(tradeConf: ITradeConf): void {
    const {  pair, action } = tradeConf;
    if (pair && action) {
      this.webSocketConfig = {
        url: `${this.ws}${pair}${action}`,
      };
    }
  }

  public connectWebSocket(): void {
    this.updateWsConfig({pair: this.tradePair, action: this.tradeActions.trade});

    if (!this.websocket$ || this.websocket$.closed) {

      this.websocket$ = webSocket(this.webSocketConfig);
      this.websocket$
        .pipe(
          distinctUntilChanged(),
        )
        .subscribe(
          (item: IBTrade) => {
            console.log(this.websocket$, 'name: ', item.s, 'price: ', item.p);
          },

          err => {
            console.log(err);
          },

          () => {
            console.log('complete');
          }
      );
    }
  }

  public ngOnDestroy(): void {
    this.closeWebSocket();
    this.websocket$.complete();
    this.subs$.next();
    this.subs$.complete();
  }

  public closeWebSocket(): void {
    this.websocket$.unsubscribe(
      this.updateWsConfig({
        pair: this.tradePair,
        action: this.tradeActions.depth
      })
    );
  }
}
