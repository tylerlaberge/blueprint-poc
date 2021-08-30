import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Blueprint, Port, PortType } from 'src/types/blueprint';
import { v4 as uuid } from 'uuid';
import { appendEmit, mapEmit, filterEmit } from '../../utils/rxjs/utils';
import { BlueprintContractComponent } from './blueprint-contract/blueprint-contract.component';
import { PortControlComponent } from './port/port-control/port-control.component';

@Component({
  selector: 'blueprint',
  templateUrl: './blueprint.component.html',
  styleUrls: ['./blueprint.component.scss']
})
export class BlueprintComponent implements OnInit {

  public identifier: string = uuid();

  _blueprint$: BehaviorSubject<Blueprint | null> = new BehaviorSubject<Blueprint | null>(null);

  _inputs$: BehaviorSubject<Port[]> = new BehaviorSubject<Port[]>([]);
  _outputs$: BehaviorSubject<Port[]> = new BehaviorSubject<Port[]>([]);
  _dragging$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  _locked$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Input() set blueprint(value: Blueprint) { this._blueprint$.next(value); };

  @Output() onDrag = new EventEmitter<string>();

  @ViewChild(BlueprintContractComponent) blueprintContractControl!: BlueprintContractComponent;

  ngOnInit(): void {
    this._blueprint$
      .pipe(
        filter(blueprint => blueprint !== null)
      ).subscribe(blueprint => {
        blueprint!.inputs.forEach(input => this.addInput(input));
        blueprint!.outputs.forEach(output => this.addOutput(output));
        this._locked$.next(true);
      });
  }

  getInputs(): Observable<Port[]> {
    return this._inputs$;
  }

  getOutputs(): Observable<Port[]> {
    return this._outputs$;
  }

  getInputPortControl(inputPortId: string): PortControlComponent | undefined {
    return this.blueprintContractControl.getInputControls()
      .find(portControl => portControl.getIdentifier() === inputPortId);
  }

  getOutputPortControl(outputPortId: string): PortControlComponent | undefined {
    return this.blueprintContractControl.getOutputControls()
      .find(portControl => portControl.getIdentifier() === outputPortId);
  }

  grab() {
    this._dragging$.next(true);
  }

  release() {
    this._dragging$.next(false);
  }

  drag() {
    this.onDrag.emit(this.identifier);
  }
  
  addInput(input: Port = {id: uuid(), direction: 'input', datatype: 'number'}) {
    if (!this._locked$.getValue()) {
      appendEmit(this._inputs$, {...input, direction: 'input'});
    }
  }

  addOutput(output: Port = {id: uuid(), direction: 'output', datatype: 'number'}) {
    if (!this._locked$.getValue()) {
      appendEmit(this._outputs$, {...output, direction: 'output'});
    }
  }

  selectPortType({port, datatype}: {port: Port, datatype?: PortType}) {
    if (datatype) {
      let ports$ = isInput(port.direction) ? this._inputs$ : this._outputs$;
      mapEmit(ports$, p => p.id === port.id ? {...p, datatype} : p);
    }
  }

  deletePort(selectedPort: Port) {
    let ports$ = isInput(selectedPort.direction) ? this._inputs$ : this._outputs$;
    filterEmit(ports$, port => port.id !== selectedPort.id);
  }

  toggleLock() {
    this._locked$.next(!this._locked$.getValue());
  }
}

export function isInput(value: 'input' | 'output'): value is 'input' {
  return value === 'input';
}

export function isOutput(value: 'input' | 'output'): value is 'output' {
  return value === 'output';
}