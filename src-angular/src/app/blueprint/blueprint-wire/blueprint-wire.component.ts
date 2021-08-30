import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as LeaderLine from 'leader-line-new';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PortControlComponent } from '../port/port-control/port-control.component';

@Component({
  selector: 'blueprint-wire',
  templateUrl: './blueprint-wire.component.html',
  styleUrls: ['./blueprint-wire.component.scss']
})
export class BlueprintWireComponent implements OnInit, OnDestroy {

    private _subscriptions: Subscription[] = [];
    private _leaderLine$: BehaviorSubject<LeaderLine | null> = new BehaviorSubject<LeaderLine | null>(null);

    _inputPort$: BehaviorSubject<PortControlComponent | null> = new BehaviorSubject<PortControlComponent | null>(null);
    _outputPort$: BehaviorSubject<PortControlComponent | null> = new BehaviorSubject<PortControlComponent | null>(null);
    _refresh$!: Observable<void>;

    @Input() set input(value: PortControlComponent) { this._inputPort$.next(value); }
    @Input() set output(value: PortControlComponent) { this._outputPort$.next(value); }
    @Input() set refresh(value: Observable<void>) { this._refresh$ = value; }

    ngOnInit() {
      this._subscriptions.push(this._leaderLine$.subscribe(leaderLine => leaderLine?.position()));
      this._subscriptions.push(this._refresh$.subscribe(() => this._leaderLine$.getValue()?.position()));
      this._subscriptions.push(combineLatest([this._inputPort$, this._outputPort$])
          .pipe(
              filter(([input, output]) => !!input && !!output),
          ).subscribe(([input, output]) => {
              this._leaderLine$.getValue()?.remove();
              this._leaderLine$.next(this.drawLeaderLine(output!.getPortElement(), input!.getPortElement()))
          }));
    }

    ngOnDestroy() {
      this._subscriptions.forEach(sub => sub.unsubscribe());
      this._leaderLine$.getValue()?.remove();
    }

    private drawLeaderLine(start: HTMLElement, end: HTMLElement): LeaderLine {
        return new LeaderLine(start, end, {
          startPlugColor: '#da8b66',
          endPlugColor: '#9eda66',
          gradient: true,
          endPlug: 'behind',
          dash: {animation: {duration: 150, timing: 'linear'}},
          startSocket: 'right',
          endSocket: 'left',
          startSocketGravity: [100, 0],
          endSocketGravity: [-100, 0]
        });
      }
}