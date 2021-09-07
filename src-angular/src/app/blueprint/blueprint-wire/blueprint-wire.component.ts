import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as LeaderLine from 'leader-line-new';
import { BehaviorSubject, combineLatest, Observable, Subscription, fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SassHelperComponent } from 'src/app/sass-helper/sass-helper.component';
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

    _anchorWidth$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    _anchorHeight$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    _sassHelper$: BehaviorSubject<SassHelperComponent | null> = new BehaviorSubject<SassHelperComponent | null>(null);

    @Input() set input(value: PortControlComponent | undefined) { this._inputPort$.next(value); }
    @Input() set output(value: PortControlComponent | undefined) { this._outputPort$.next(value); }
    @Input() set refresh(value: Observable<void>) { this._refresh$ = value; }

    @ViewChild("start", {static: false}) set startAnchor(element: ElementRef) { this._startAnchor$.next(element); };
    @ViewChild("end", {static: false}) set endAnchor(element: ElementRef) { this._endAnchor$.next(element); };

    @ViewChild(SassHelperComponent) set sassHelper(sassHelper: SassHelperComponent) { this._sassHelper$.next(sassHelper); };

    ngOnInit() {
      /**
       * Get the anchor width/height values once it's available
       */
      this._subscriptions.push(this._startAnchor$
        .pipe(filter(anchor => !!anchor))
        .subscribe((anchor) => {
          const anchorBoundingRect: DOMRect = anchor!.nativeElement.getBoundingClientRect();
          this._anchorWidth$.next(anchorBoundingRect.width);
          this._anchorHeight$.next(anchorBoundingRect.height);
        }));

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
          .subscribe((e) => this._mousePosition$.next({
            x: e.clientX - this._anchorWidth$.getValue() / 2, 
            y: e.clientY - this._anchorHeight$.getValue() / 2
          }))
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
            this._endAnchorPosition$.next(this.getPortPosition(input))
            : this._mousePosition$.subscribe(this._endAnchorPosition$);
          
          output ?
            this._startAnchorPosition$.next(this.getPortPosition(output))
            : this._mousePosition$.subscribe(this._startAnchorPosition$);
        }));

      /**
       * When that start/end anchors are added to the dom, draw a leaderline between them
       */
      this._subscriptions.push(combineLatest([this._startAnchor$, this._endAnchor$, this._sassHelper$])
        .pipe(
          filter(([start, end, sassHelper]) => !!start && !!end && !!sassHelper)
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
        this._endAnchorPosition$.next(this.getPortPosition(inputPort));
      }

      if (outputPort) {
        this._startAnchorPosition$.next(this.getPortPosition(outputPort));
      }
    }

    private getPortPosition(portControl: PortControlComponent) {
      return {
        x: portControl.getPortElement().getBoundingClientRect().left, 
        y: portControl.getPortElement().getBoundingClientRect().top
      };
    }

    private drawLeaderLine(start: HTMLElement, end: HTMLElement): LeaderLine {
      const datatype = this._inputPort$.getValue()?.getDataType() || this._outputPort$.getValue()?.getDataType();
      const wireColor = this._sassHelper$.getValue()!.readProperty(`color-${datatype}`);
      return new LeaderLine(start, end, {
        color: wireColor,
        endPlug: 'behind',
        size: 3,
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