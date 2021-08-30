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
  _blueprintWirings$: BehaviorSubject<BlueprintWiring[]> = new BehaviorSubject<BlueprintWiring[]>([]);
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

    blueprintA.outputs[0].connection = blueprintB.inputs[0];
    blueprintA.outputs[1].connection = blueprintB.inputs[1];

    blueprintB.inputs[0].connection = blueprintA.outputs[0];
    blueprintB.inputs[1].connection = blueprintA.outputs[1];

    this._blueprints$.next([blueprintA, blueprintB]);
  }

  ngAfterViewInit(): void {
    this.updatePortMappings();
    this.initPortConnections();
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

  private initPortConnections() {
    this.blueprintComponents.forEach(blueprint => {
      blueprint.getInputs().pipe(
        take(1),
        concatAll(),
        filter(input => !!input.connection),
        map(connectedInput => [connectedInput.id, connectedInput.connection!.id])
      ).subscribe(([inputPortId, outputPortId]) => {
        let inputBlueprint = blueprint;
        let outputBlueprint = this._portMappings$.getValue()[outputPortId];
        setTimeout(() => appendEmit(this._blueprintWirings$, {
          input: inputBlueprint.getInputPortControl(inputPortId)!, 
          output: outputBlueprint.getOutputPortControl(outputPortId)!
        }));
      });
    });
  }

  handleBlueprintMove(blueprintId: string) {
    this._refreshWirings$.next();
  }

  handlePortChange(blueprint: BlueprintComponent, port: Port) {
    mapEmit(this._blueprintWirings$, (wiring: BlueprintWiring) => {
      if (wiring.input.getIdentifier() === port.id) {
        return {input: blueprint.getInputPortControl(port.id)!, output: wiring.output};
      } else if (wiring.output.getIdentifier() === port.id) {
        return {input: wiring.input, output: blueprint.getOutputPortControl(port.id)!};
      } else {
        return wiring;
      }
    });
  }

  handleDestroyInputPort(portControl: PortControlComponent) {
    setTimeout(() => {
      filterEmit(this._blueprintWirings$, wiring => wiring.input.getIdentifier() !== portControl.getIdentifier())
      setTimeout(() => this._refreshWirings$.next());
    });
  }

  handleDestroyOutputPort(portControl: PortControlComponent) {
    setTimeout(() => {
      filterEmit(this._blueprintWirings$, wiring => wiring.output.getIdentifier() !== portControl.getIdentifier());
      setTimeout(() => this._refreshWirings$.next());
    });
  }
}

interface BlueprintWiring {
  input: PortControlComponent,
  output: PortControlComponent
};