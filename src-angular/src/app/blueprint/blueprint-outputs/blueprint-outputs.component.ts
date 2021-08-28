import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Port, PortType } from 'src/types/blueprint';
import { PortControlComponent } from '../port/port-control/port-control.component';
import { PortListControlComponent } from '../port/port-list-control/port-list-control.component';

@Component({
  selector: 'blueprint-outputs',
  templateUrl: './blueprint-outputs.component.html',
  styleUrls: ['./blueprint-outputs.component.scss']
})
export class BlueprintOutputsComponent {

  _outputs$ = new BehaviorSubject<Port[]>([]);
  _locked$ = new BehaviorSubject<boolean>(false);

  @Input() set outputs(value: Port[]) { this._outputs$.next(value); };
  @Input() set locked(value: boolean) { this._locked$.next(value); };

  @Output() onAddOutput = new EventEmitter<void>();
  @Output() onSelectOutputDatatype = new EventEmitter<{port: Port, datatype?: PortType}>();
  @Output() onDeleteOutput = new EventEmitter<Port>();

  @ViewChildren(PortListControlComponent) portListControls!: QueryList<PortListControlComponent>;

  getOutputControls(): PortControlComponent[] {
    return this.portListControls
      .reduce((portControls: PortControlComponent[], portListControl: PortListControlComponent) => portControls.concat(portListControl.getPortControls()), []);
  }

  addOutput() {
    this.onAddOutput.emit();
  }

  deleteOutput(port: Port) {
    this.onDeleteOutput.emit(port);
  }

  selectOutputDatatype({port, datatype}: {port: Port, datatype?: PortType}) {
    this.onSelectOutputDatatype.emit({port, datatype});
  }
}