import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Port, PortType } from 'src/types/blueprint';
import { PortControlComponent } from '../port-control/port-control.component';

@Component({
  selector: 'port-list-control',
  templateUrl: './port-list-control.component.html',
  styleUrls: ['./port-list-control.component.scss']
})
export class PortListControlComponent {

    _locked$ = new BehaviorSubject<boolean>(false);
    _direction$ = new BehaviorSubject<'input' | 'output' | null>(null);
    _ports$ = new BehaviorSubject<Port[]>([]);

    @Input() set ports(value: Port[]) { this._ports$.next(value); };
    @Input() set locked(value: boolean) { this._locked$.next(value); };
    @Input() set direction(value: 'input' | 'output') { this._direction$.next(value); };

    @Output() onAddPort = new EventEmitter<void>();
    @Output() onSelectDatatype = new EventEmitter<{port: Port, datatype?: PortType}>();
    @Output() onDeletePort = new EventEmitter<Port>();
    @Output() onDestroyPort = new EventEmitter<PortControlComponent>();
    @Output() onClickPort = new EventEmitter<PortControlComponent>();

    @ViewChildren(PortControlComponent) portControls!: QueryList<PortControlComponent>;

    getPortControls(): PortControlComponent[] {
      return this.portControls.toArray();
    }

    addPort() {
      this.onAddPort.emit();
    }

    selectDatatype(port: Port, datatype?: PortType) {
      this.onSelectDatatype.emit({port, datatype});
    }

    deletePort(port: Port) {
      this.onDeletePort.emit(port);
    }

    notifyDestroyPort(portControl: PortControlComponent) {
      this.onDestroyPort.emit(portControl);
    }

    clickPort(portControl: PortControlComponent) {
      this.onClickPort.emit(portControl);
    }

    isInput(): boolean {
      return this._direction$.getValue() === 'input';
    }
  
    isOutput(): boolean {
      return this._direction$.getValue() === 'output';
    }
}