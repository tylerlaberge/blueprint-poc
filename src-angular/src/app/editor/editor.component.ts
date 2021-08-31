import { AfterViewInit, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { Blueprint, Port } from 'src/types/blueprint';
import { BlueprintComponent } from '../blueprint/blueprint.component';
import { v4 as uuid } from 'uuid';
import { concatAll, map, filter, take } from 'rxjs/operators';
import { PortControlComponent } from '../blueprint/port/port-control/port-control.component';
import { appendEmit, filterEmit, mapEmit } from 'src/utils/rxjs/utils';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit, OnInit {

  _blueprints$: BehaviorSubject<Blueprint[]> = new BehaviorSubject<Blueprint[]>([]);
  _blueprintWirings$: BehaviorSubject<Partial<BlueprintWiring>[]> = new BehaviorSubject<Partial<BlueprintWiring>[]>([]);
  _portMappings$: BehaviorSubject<{[portId: string]: BlueprintComponent}> = new BehaviorSubject<{[portId: string]: BlueprintComponent}>({});

  _refreshWirings$: Subject<void> = new Subject();

  @ViewChildren(BlueprintComponent) blueprintComponents!: QueryList<BlueprintComponent>;

  constructor() { }

  ngOnInit(): void {
    let blueprintA: Blueprint = {id: uuid(), position: {x: 400, y: 500}, inputs: [
      {id: uuid(), direction: 'input', datatype: 'number'},
      {id: uuid(), direction: 'input', datatype: 'number'},
    ], outputs: [
      {id: uuid(), direction: 'input', datatype: 'bool'},
      {id: uuid(), direction: 'input', datatype: 'bool'},
    ]};
    let blueprintB: Blueprint = {id: uuid(), position: {x: 1200, y: 700}, inputs: [
      {id: uuid(), direction: 'output', datatype: 'bool'},
      {id: uuid(), direction: 'output', datatype: 'bool'},
    ], outputs: []};

    this._blueprints$.next([blueprintA, blueprintB]);
  }

  ngAfterViewInit(): void {
    this.updatePortMappings();
  }

  private updatePortMappings() {
    let allPortMappings = {};
    this.blueprintComponents.forEach(blueprint => {
      combineLatest([blueprint.getInputs(), blueprint.getOutputs()]).pipe(
        take(1),
        map(([inputs, outputs]) => inputs.map(i => i.id).concat(outputs.map(o => o.id))),
        map((portIds) => portIds.reduce<{[portId: string]: BlueprintComponent}>((mappings, portId) => {
          mappings[portId] = blueprint;
          return mappings;
        }, {}))
      ).subscribe(blueprintPortMappings => {
        allPortMappings = {...allPortMappings, ...blueprintPortMappings};
      });
    });
    this._portMappings$.next(allPortMappings);
  }

  handleBlueprintMove(blueprintId: string) {
    this._refreshWirings$.next();
  }

  handlePortChange(blueprint: BlueprintComponent, port: Port) {
    mapEmit(this._blueprintWirings$, (wiring: Partial<BlueprintWiring>) => {
      if (wiring.input!.getIdentifier() === port.id) {
        return {input: blueprint.getInputPortControl(port.id)!, output: wiring.output};
      } else if (wiring.output!.getIdentifier() === port.id) {
        return {input: wiring.input, output: blueprint.getOutputPortControl(port.id)!};
      } else {
        return wiring;
      }
    });
  }

  handleDestroyInputPort(portControl: PortControlComponent) {
    setTimeout(() => {
      filterEmit(this._blueprintWirings$, wiring => wiring.input!.getIdentifier() !== portControl.getIdentifier())
      setTimeout(() => this._refreshWirings$.next());
    });
  }

  handleDestroyOutputPort(portControl: PortControlComponent) {
    setTimeout(() => {
      filterEmit(this._blueprintWirings$, wiring => wiring.output!.getIdentifier() !== portControl.getIdentifier());
      setTimeout(() => this._refreshWirings$.next());
    });
  }

  handleClickInputPort(portControl: PortControlComponent) {
    appendEmit(this._blueprintWirings$, {input: portControl});
  }

  handleClickOutputPort(portControl: PortControlComponent) {
    appendEmit(this._blueprintWirings$, {output: portControl});
  }
}

interface BlueprintWiring {
  input: PortControlComponent,
  output: PortControlComponent
};