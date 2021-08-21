import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { appendEmit, mapEmit, filterEmit } from '../../utils/rxjs/utils';

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
    appendEmit(this.inputs$, {id: uuid(), direction: 'input', type: {name: 'foo'}});
  }

  addOutput() {
    appendEmit(this.outputs$, {id: uuid(), direction: 'output', type: {name: 'bar'}});
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
      mapEmit(ports$, port => port.id === selectedPort.id ? {...port, type: selectedType} : port);
    }
  }

  deletePort(selectedPort: Port) {
    let ports$ = isInput(selectedPort.direction) ? this.inputs$ : this.outputs$;
    filterEmit(ports$, port => port.id !== selectedPort.id);
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