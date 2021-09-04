import { Component, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { BehaviorSubject } from 'rxjs';
import { PortType } from 'src/types/blueprint';

@Component({
  selector: 'port-datatype',
  templateUrl: './port-datatype.component.html',
  styleUrls: ['./port-datatype.component.scss']
})
export class PortDatatypeComponent {
  
  _datatype$ = new BehaviorSubject<PortType | undefined>(undefined);
  _direction$ = new BehaviorSubject<'input' | 'output' | undefined>(undefined);
  _locked$ = new BehaviorSubject<boolean>(false);
  _selectingDatatype$ = new BehaviorSubject<boolean>(false);
  _datatypeOptions$ = new BehaviorSubject<PortType[]>(['bool', 'number', 'string', 'object']);

  @Input() set datatype(value: PortType) { this._datatype$.next(value); }
  @Input() set direction(value: 'input' | 'output') { this._direction$.next(value); }
  @Input() set locked(value: boolean) { this._locked$.next(value); };

  @Output() onSelectDatatype = new EventEmitter<PortType>();

  @ViewChild('portDatatypeSelector') set portDatatypeSelector(select: MatSelect) {
    if (select) {
      setTimeout(() => select.open());
    }
  }

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

  openDatatypeSelector() {
    if (!this._locked$.getValue()) {
      this._selectingDatatype$.next(true);
    }
  }

  selectDatatype(type?: PortType) {
    this._selectingDatatype$.next(false);
    if (type) {
      this.onSelectDatatype.emit(type);
    }
  }
}
  