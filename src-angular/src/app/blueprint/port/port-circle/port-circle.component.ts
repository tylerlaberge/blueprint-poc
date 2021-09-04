import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'port-circle',
  templateUrl: './port-circle.component.html',
  styleUrls: ['./port-circle.component.scss']
})
export class PortCircleComponent {

    _locked$ = new BehaviorSubject<boolean>(false);
    _direction$ = new BehaviorSubject<'input' | 'output' | null>(null);
    _id$ = new BehaviorSubject<string | null>(null);

    @Input() set locked(value: boolean) { this._locked$.next(value); };
    @Input() set direction(value: 'input' | 'output') { this._direction$.next(value) };
    @Input() set id(value: string) { this._id$.next(value) };

    @Output() onClickPort = new EventEmitter<void>();

    @ViewChild('portCircleRef') elementRef!: ElementRef;

    @HostListener("mousedown", ["$event"])
    private clickPort(event: Event) {
      if (!this._locked$.getValue()) {
        event.stopPropagation();
        event.preventDefault();
        this.onClickPort.emit();
      }
    }

    isInput(): boolean {
      return this._direction$.getValue() === 'input';
    }
  
    isOutput(): boolean {
      return this._direction$.getValue() === 'output';
    }
}