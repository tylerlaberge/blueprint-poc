import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as LeaderLine from 'leader-line-new';
import { BehaviorSubject, combineLatest, Observable, Subscription, fromEvent } from 'rxjs';
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

    _inputPort$: BehaviorSubject<PortControlComponent | undefined> = new BehaviorSubject<PortControlComponent | undefined>(undefined);
    _outputPort$: BehaviorSubject<PortControlComponent | undefined> = new BehaviorSubject<PortControlComponent | undefined>(undefined);
    _refresh$!: Observable<void>;

    _startAnchorPosition$: BehaviorSubject<Position | null> = new BehaviorSubject<Position | null>(null); 
    _endAnchorPosition$: BehaviorSubject<Position | null> = new BehaviorSubject<Position | null>(null); 
    _mousePosition$: BehaviorSubject<Position | null> = new BehaviorSubject<Position | null>(null);

    _startAnchor$: BehaviorSubject<ElementRef | null> = new BehaviorSubject<ElementRef | null>(null);
    _endAnchor$: BehaviorSubject<ElementRef | null> = new BehaviorSubject<ElementRef | null>(null);

    @Input() set input(value: PortControlComponent | undefined) { this._inputPort$.next(value); }
    @Input() set output(value: PortControlComponent | undefined) { this._outputPort$.next(value); }
    @Input() set refresh(value: Observable<void>) { this._refresh$ = value; }

    @ViewChild("start", {static: false}) set startAnchor(element: ElementRef) { this._startAnchor$.next(element); };
    @ViewChild("end", {static: false}) set endAnchor(element: ElementRef) { this._endAnchor$.next(element); };

    ngOnInit() {
      /**
       * Refresh leader line when start or end anchor position changes
       */
      this._subscriptions.push(this._startAnchorPosition$.subscribe(() => this._leaderLine$.getValue()?.position()));
      this._subscriptions.push(this._endAnchorPosition$.subscribe(() => this._leaderLine$.getValue()?.position()));

      /**
       * Update mouse position anytime the mouse moves
       */
      this._subscriptions.push(
        fromEvent<MouseEvent>(document, 'mousemove')
          .subscribe((e) => this._mousePosition$.next({x: e.clientX, y: e.clientY}))
      );

      /**
       * Anytime a new leader line is created, initialize it's position
       */
      this._subscriptions.push(this._leaderLine$.subscribe(leaderLine => leaderLine?.position()));

      /**
       * Whenever this component is notified to refresh, reposition the anchors
       */
      this._subscriptions.push(this._refresh$.subscribe(() => this.repositionAnchors()));

      /**
       * Whenever an input/output port is added, set the start/end anchor positions to the port positions; or if a port is undefined, set it's anchor position to follow the mouse
       */
      this._subscriptions.push(combineLatest([this._inputPort$, this._outputPort$])
        .subscribe(([input, output]) => {
          input ?
            setTimeout(() => this._endAnchorPosition$.next(this.getPortPosition(input)))
            : setTimeout(() => this._mousePosition$.subscribe(this._endAnchorPosition$));
          
          output ?
            setTimeout(() => this._startAnchorPosition$.next(this.getPortPosition(output)))
            : setTimeout(() => this._mousePosition$.subscribe(this._startAnchorPosition$));
        }));

      /**
       * When that start/end anchors are added to the dom, draw a leaderline between them
       */
      this._subscriptions.push(combineLatest([this._startAnchor$, this._endAnchor$])
        .pipe(
          filter(([start, end]) => !!start && !!end)
        ).subscribe(([start, end]) => {
          this._leaderLine$.getValue()?.remove();
          this._leaderLine$.next(this.drawLeaderLine(start!.nativeElement, end!.nativeElement));
        }));
    }

    ngOnDestroy() {
      this._subscriptions.forEach(sub => sub.unsubscribe());
      this._leaderLine$.getValue()?.remove();
    }

    private repositionAnchors() {
      const inputPort = this._inputPort$.getValue();
      const outputPort = this._outputPort$.getValue();

      if (inputPort) {
        setTimeout(() => this._endAnchorPosition$.next(this.getPortPosition(inputPort)));
      }

      if (outputPort) {
        setTimeout(() => this._startAnchorPosition$.next(this.getPortPosition(outputPort)));
      }
    }

    private getPortPosition(portControl: PortControlComponent) {
      return {
        x: portControl.getPortElement().getBoundingClientRect().left, 
        y: portControl.getPortElement().getBoundingClientRect().top
      };
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

interface Position {
  x: number,
  y: number
}