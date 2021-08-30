import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Port, PortType } from 'src/types/blueprint';
import { PortControlComponent } from '../port/port-control/port-control.component';
import { PortListControlComponent } from '../port/port-list-control/port-list-control.component';

@Component({
  selector: 'blueprint-inputs',
  templateUrl: './blueprint-inputs.component.html',
  styleUrls: ['./blueprint-inputs.component.scss']
})
export class BlueprintInputsComponent {

  _inputs$ = new BehaviorSubject<Port[]>([]);
  _locked$ = new BehaviorSubject<boolean>(false);

  @Input() set inputs(value: Port[]) { this._inputs$.next(value); };
  @Input() set locked(value: boolean) { this._locked$.next(value); };

  @Output() onAddInput = new EventEmitter<void>();
  @Output() onSelectInputDatatype = new EventEmitter<{port: Port, datatype?: PortType}>();
  @Output() onDeleteInput = new EventEmitter<Port>();
  @Output() onDestroyInputPort = new EventEmitter<PortControlComponent>();

  @ViewChildren(PortListControlComponent) portListControls!: QueryList<PortListControlComponent>;

  getInputControls(): PortControlComponent[] {
    return this.portListControls
      .reduce((portControls: PortControlComponent[], portListControl: PortListControlComponent) => portControls.concat(portListControl.getPortControls()), []);
  }

  addInput() {
    this.onAddInput.emit();
  }

  deleteInput(port: Port) {
    this.onDeleteInput.emit(port);
  }

  selectInputDatatype({port, datatype}: {port: Port, datatype?: PortType}) {
    this.onSelectInputDatatype.emit({port, datatype});
  }

  notifyDestroyInputPort(portControl: PortControlComponent) {
    this.onDestroyInputPort.emit(portControl);
  }
}