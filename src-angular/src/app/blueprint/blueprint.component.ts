import { Component, OnInit, Output, EventEmitter, Input, ViewChildren, QueryList } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Blueprint, Port, PortType } from 'src/types/blueprint';
import { v4 as uuid } from 'uuid';
import { appendEmit, mapEmit, filterEmit } from '../../utils/rxjs/utils';
import { PortControlComponent } from './port/port-control/port-control.component';
import { PortListControlComponent } from './port/port-list-control/port-list-control.component';

@Component({
  selector: 'app-blueprint',
  templateUrl: './blueprint.component.html',
  styleUrls: ['./blueprint.component.scss']
})
export class BlueprintComponent implements OnInit {

  public identifier: string = uuid();

  public inputs$: BehaviorSubject<Port[]> = new BehaviorSubject<Port[]>([]);
  public outputs$: BehaviorSubject<Port[]> = new BehaviorSubject<Port[]>([]);
  public portTypes$: BehaviorSubject<PortType[]> = new BehaviorSubject<PortType[]>(['number', 'bool', 'string', 'object']); 
  
  public isDragging$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isLocked$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public showPortTypeSelectorId$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  @Input() blueprint!: Blueprint;
  @Output() onDrag = new EventEmitter<string>();

  @ViewChildren(PortListControlComponent) portListControls!: QueryList<PortListControlComponent>;

  ngOnInit(): void {
    this.blueprint.inputs.forEach(input => this.addInput(input));
    this.blueprint.outputs.forEach(output => this.addOutput(output));
    this.isLocked$.next(true);
  }

  getPortElement(portId: string): HTMLElement {
    return this.portListControls
      .reduce((portControls: PortControlComponent[], portListControl: PortListControlComponent) => portControls.concat(portListControl.getPortControls()), [])
      .map(portControl => portControl.portCircleComponent.elementRef.nativeElement)
      .find(nativeElement => nativeElement.getAttribute('id') === portId);
  }

  grab() {
    this.isDragging$.next(true);
  }

  release() {
    this.isDragging$.next(false);
  }

  drag() {
    this.onDrag.emit(this.identifier);
  }
  
  addInput(input: Port = {id: uuid(), direction: 'input', datatype: 'number'}) {
    if (!this.isLocked$.getValue()) {
      appendEmit(this.inputs$, {...input, direction: 'input'});
    }
  }

  addOutput(output: Port = {id: uuid(), direction: 'output', datatype: 'number'}) {
    if (!this.isLocked$.getValue()) {
      appendEmit(this.outputs$, {...output, direction: 'output'});
    }
  }

  selectPortType({port, datatype}: {port: Port, datatype?: PortType}) {
    this.showPortTypeSelectorId$.next(null);
    if (datatype) {
      let ports$ = isInput(port.direction) ? this.inputs$ : this.outputs$;
      mapEmit(ports$, p => p.id === port.id ? {...p, datatype} : p);
    }
  }

  deletePort(selectedPort: Port) {
    let ports$ = isInput(selectedPort.direction) ? this.inputs$ : this.outputs$;
    filterEmit(ports$, port => port.id !== selectedPort.id);
  }

  toggleLock() {
    this.isLocked$.next(!this.isLocked$.getValue());
  }
}

export function isInput(value: 'input' | 'output'): value is 'input' {
  return value === 'input';
}

export function isOutput(value: 'input' | 'output'): value is 'output' {
  return value === 'output';
}