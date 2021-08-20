import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { mutate } from '../../utils/rxjs/utils';

@Component({
  selector: 'app-blueprint',
  templateUrl: './blueprint.component.html',
  styleUrls: ['./blueprint.component.scss']
})
export class BlueprintComponent implements OnInit {

  public inputs$: BehaviorSubject<Port[]> = new BehaviorSubject<Port[]>([]);
  public outputs$: BehaviorSubject<Port[]> = new BehaviorSubject<Port[]>([]);
  public portTypes$: BehaviorSubject<PortType[]> = new BehaviorSubject<PortType[]>([{name: 'number'}, {name: 'bool'}, {name: 'string'}]); 
  
  public isDragging$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public showPortTypeSelectorId$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  @ViewChild('portTypeSelector') set portTypeSelector(select: MatSelect) {
    if (select) {
      setTimeout(() => select.open());
    }
  }

  constructor() { }

  ngOnInit(): void { }

  grab() {
    this.isDragging$.next(true);
  }

  release() {
    this.isDragging$.next(false);
  }
  
  addInput() {
    let currentInputs = this.inputs$.getValue();
    this.inputs$.next([...currentInputs, {id: uuid(), direction: 'input', type: {name: 'foo'}}]);
  }

  addOutput() {
    let currentOutputs = this.outputs$.getValue();
    this.outputs$.next([...currentOutputs, {id: uuid(), direction: 'output', type: {name: 'bar'}}]);
  }

  clickPortType(port: Port) {
    this.showPortTypeSelectorId$.next(port.id);
  }

  shouldShowPortTypeSelector(port: Port) {
    return this.showPortTypeSelectorId$.getValue() === port.id;
  }

  selectPortType(selectedPort: Port, selectedType?: PortType) {
    this.showPortTypeSelectorId$.next(null);
    if (selectedType) {
      let ports$ = isInput(selectedPort.direction) ? this.inputs$ : this.outputs$;
      mutate(ports$, port => port.id === selectedPort.id ? {...port, type: selectedType} : port);
    }
  }
}

export type Input = 'input';
export type Output = 'output';

export interface PortType {
  name: string
}

export interface Port {
  id: string;
  direction: Input | Output;
  type: PortType;
}

export function isInput(value: Input | Output): value is Input {
  return value === 'input';
}

export function isOutput(value: Input | Output): value is Output {
  return value === 'output';
}