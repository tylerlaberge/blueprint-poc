import { AfterViewInit, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import * as LeaderLine from 'leader-line-new';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Blueprint } from 'src/types/blueprint';
import { BlueprintComponent } from '../blueprint/blueprint.component';
import { v4 as uuid } from 'uuid';
import { concatAll, map, filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit, OnInit {

  public blueprints$: BehaviorSubject<Blueprint[]> = new BehaviorSubject<Blueprint[]>([]);

  private portMappings$: BehaviorSubject<{[portId: string]: BlueprintComponent}> = new BehaviorSubject<{[portId: string]: BlueprintComponent}>({});
  private connectorMappings$: BehaviorSubject<{[blueprintId: string]: LeaderLine[]}> = new BehaviorSubject<{[blueprintId: string]: LeaderLine[]}>({});

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

    this.blueprints$.next([blueprintA, blueprintB]);
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
    this.portMappings$.next(allPortMappings);
  }

  private initPortConnections() {
    let allConnectorMappings: {[blueprintId: string]: LeaderLine[]} = {};
    this.blueprintComponents.forEach(blueprint => {
      blueprint.getInputs().pipe(
        take(1),
        concatAll(),
        filter(input => !!input.connection),
        map(connectedInput => [connectedInput.id, connectedInput.connection!.id])
      ).subscribe(([inputPortId, outputPortId]) => {
        let inputBlueprint = blueprint;
        let outputBlueprint = this.portMappings$.getValue()[outputPortId];
        let connector = this.drawPortConnector(outputBlueprint.getOutputPortElement(outputPortId), inputBlueprint.getInputPortElement(inputPortId));
        if (allConnectorMappings[inputBlueprint.identifier]) {
          allConnectorMappings[inputBlueprint.identifier].push(connector);
          allConnectorMappings[outputBlueprint.identifier].push(connector);
        } else {
          allConnectorMappings[inputBlueprint.identifier] = [connector];
          allConnectorMappings[outputBlueprint.identifier] = [connector];
        }
      });
      this.connectorMappings$.next(allConnectorMappings);
    });
  }

  private drawPortConnector(start: HTMLElement, end: HTMLElement): LeaderLine {
    return new LeaderLine(start, end, {
      startPlugColor: '#da8b66',
      endPlugColor: '#9eda66',
      gradient: true,
      endPlug: 'behind',
      dash: {animation: {duration: 150, timing: 'linear'}},
      startSocket: 'right',
      endSocket: 'left',
      startSocketGravity: [100, 0],
      endSocketGravity: [-100, 0]
    });
  }

  handleBlueprintMove(blueprintId: string) {
    let connectors: LeaderLine[] = this.connectorMappings$.getValue()[blueprintId] || [];
    connectors.forEach(connector => connector.position());
  }
}