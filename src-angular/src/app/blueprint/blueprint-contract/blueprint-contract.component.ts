import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Port, PortType } from 'src/types/blueprint';
import { BlueprintInputsComponent } from '../blueprint-inputs/blueprint-inputs.component';
import { BlueprintOutputsComponent } from '../blueprint-outputs/blueprint-outputs.component';
import { PortControlComponent } from '../port/port-control/port-control.component';

@Component({
  selector: 'blueprint-contract',
  templateUrl: './blueprint-contract.component.html',
  styleUrls: ['./blueprint-contract.component.scss']
})
export class BlueprintContractComponent {

  _inputs$ = new BehaviorSubject<Port[]>([]);
  _outputs$ = new BehaviorSubject<Port[]>([]);
  _locked$ = new BehaviorSubject<boolean>(false);

  @Input() set inputs(value: Port[]) { this._inputs$.next(value); };
  @Input() set outputs(value: Port[]) { this._outputs$.next(value); };
  @Input() set locked(value: boolean) { this._locked$.next(value); };

  @Output() onAddInput = new EventEmitter<void>();
  @Output() onSelectInputDatatype = new EventEmitter<{port: Port, datatype?: PortType}>();
  @Output() onDeleteInput = new EventEmitter<Port>();
  @Output() onDestroyInputPort = new EventEmitter<PortControlComponent>();

  @Output() onAddOutput = new EventEmitter<void>();
  @Output() onSelectOutputDatatype = new EventEmitter<{port: Port, datatype?: PortType}>();
  @Output() onDeleteOutput = new EventEmitter<Port>();
  @Output() onDestroyOutputPort = new EventEmitter<PortControlComponent>();

  @ViewChild(BlueprintInputsComponent) blueprintInputsControl!: BlueprintInputsComponent;
  @ViewChild(BlueprintOutputsComponent) blueprintOutputsControl!: BlueprintOutputsComponent;

  getInputControls(): PortControlComponent[] {
    return this.blueprintInputsControl.getInputControls();
  }

  getOutputControls(): PortControlComponent[] {
    return this.blueprintOutputsControl.getOutputControls();
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

  addOutput() {
    this.onAddOutput.emit();
  }

  deleteOutput(port: Port) {
    this.onDeleteOutput.emit(port);
  }

  selectOutputDatatype({port, datatype}: {port: Port, datatype?: PortType}) {
    this.onSelectOutputDatatype.emit({port, datatype});
  }

  notifyDestroyInputPort(portControl: PortControlComponent) {
    this.onDestroyInputPort.emit(portControl);
  }

  notifyDestroyOutputPort(portControl: PortControlComponent) {
    this.onDestroyOutputPort.emit(portControl);
  }
}