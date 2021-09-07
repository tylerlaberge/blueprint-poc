import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PortType } from 'src/types/blueprint';

@Component({
  selector: 'port-circle',
  templateUrl: './port-circle.component.html',
  styleUrls: ['./port-circle.component.scss']
})
export class PortCircleComponent {

    _hidden$ = new BehaviorSubject<boolean>(false);
    _locked$ = new BehaviorSubject<boolean>(false);
    _direction$ = new BehaviorSubject<'input' | 'output' | null>(null);
    _datatype$ = new BehaviorSubject<PortType | null>(null);
    _id$ = new BehaviorSubject<string | null>(null);

    @Input() set hidden(value: boolean) { this._hidden$.next(value); };
    @Input() set locked(value: boolean) { this._locked$.next(value); };
    @Input() set direction(value: 'input' | 'output') { this._direction$.next(value) };
    @Input() set datatype(value: PortType) { this._datatype$.next(value) };
    @Input() set id(value: string) { this._id$.next(value) };

    @Output() onClickPort = new EventEmitter<void>();

    @ViewChild('portCircleRef') elementRef!: ElementRef;

    @HostListener("mousedown", ["$event"])
    private stopPropagation(event: Event) {
      if (!this._locked$.getValue()) {
        event.stopPropagation();
        event.preventDefault();
      }
    }

    isInput(): boolean {
      return this._direction$.getValue() === 'input';
    }
  
    isOutput(): boolean {
      return this._direction$.getValue() === 'output';
    }

    isNumberDatatype(): boolean {
      return this._datatype$.getValue() === 'number';
    }

    isBoolDatatype(): boolean {
      return this._datatype$.getValue() === 'bool';
    }

    isStringDatatype(): boolean {
      return this._datatype$.getValue() === 'string';
    }

    isObjectDatatype(): boolean {
      return this._datatype$.getValue() === 'object';
    }

    notifyClickPort() {
      if (!this._locked$.getValue()) {
        this.onClickPort.emit();
      }
    }
}