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
export class BlueprintWireComponent implements OnInit, AfterViewInit, OnDestroy {

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
      this._subscriptions.push(this._startAnchorPosition$.subscribe(() => this._leaderLine$.getValue()?.position()));
      this._subscriptions.push(this._endAnchorPosition$.subscribe(() => this._leaderLine$.getValue()?.position()));

      this._subscriptions.push(
        fromEvent<MouseEvent>(document, 'mousemove')
          .subscribe((e) => this._mousePosition$.next({x: e.clientX, y: e.clientY}))
      );
      this._subscriptions.push(this._leaderLine$.subscribe(leaderLine => leaderLine?.position()));
      this._subscriptions.push(this._refresh$.subscribe(() => this._leaderLine$.getValue()?.position()));
      this._subscriptions.push(combineLatest([this._inputPort$, this._outputPort$])
        .subscribe(([input, output]) => {
          input ?
            setTimeout(() => this._endAnchorPosition$.next({x: input.getPortElement().getBoundingClientRect().left, y: input.getPortElement().getBoundingClientRect().top}))
            : setTimeout(() => this._mousePosition$.subscribe(this._endAnchorPosition$));
          
          output ?
            setTimeout(() => this._startAnchorPosition$.next({x: output.getPortElement().getBoundingClientRect().left, y: output.getPortElement().getBoundingClientRect().top}))
            : setTimeout(() => this._mousePosition$.subscribe(this._startAnchorPosition$));
        }));
      this._subscriptions.push(combineLatest([this._startAnchor$, this._endAnchor$])
        .pipe(
          filter(([start, end]) => !!start && !!end)
        ).subscribe(([start, end]) => {
          this._leaderLine$.getValue()?.remove();
          this._leaderLine$.next(this.drawLeaderLine(start!.nativeElement, end!.nativeElement));
        }));
    }

    ngAfterViewInit() {

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

interface Position {
  x: number,
  y: number
}