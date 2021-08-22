import { Component, OnInit, Output, ViewChild, EventEmitter, ElementRef, Input, ViewChildren, QueryList } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { BehaviorSubject } from 'rxjs';
import { Blueprint, Port, PortType } from 'src/types/blueprint';
import { v4 as uuid } from 'uuid';
import { appendEmit, mapEmit, filterEmit } from '../../utils/rxjs/utils';

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

  @ViewChildren('port') portElements!: QueryList<ElementRef>;
  @ViewChild('portTypeSelector') set portTypeSelector(select: MatSelect) {
    if (select) {
      setTimeout(() => select.open());
    }
  }

  ngOnInit(): void {
    this.blueprint.inputs.forEach(input => this.addInput(input));
    this.blueprint.outputs.forEach(output => this.addOutput(output));
    this.isLocked$.next(true);
  }

  getPortElement(portId: string): HTMLElement {
    return this.portElements
      .map(element => element.nativeElement)
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

  clickPortType(port: Port) {
    if (!this.isLocked$.getValue()) {
      this.showPortTypeSelectorId$.next(port.id);
    }
  }

  shouldShowPortTypeSelector(port: Port) {
    return this.showPortTypeSelectorId$.getValue() === port.id;
  }

  selectPortType(selectedPort: Port, selectedType?: PortType) {
    this.showPortTypeSelectorId$.next(null);
    if (selectedType) {
      let ports$ = isInput(selectedPort.direction) ? this.inputs$ : this.outputs$;
      mapEmit(ports$, port => port.id === selectedPort.id ? {...port, datatype: selectedType} : port);
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