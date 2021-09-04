import { Component, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Blueprint, Port } from 'src/types/blueprint';
import { BlueprintComponent } from '../blueprint/blueprint.component';
import { v4 as uuid } from 'uuid';
import { PortControlComponent } from '../blueprint/port/port-control/port-control.component';
import { appendEmit, filterEmit, mapEmit } from 'src/utils/rxjs/utils';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  _blueprints$: BehaviorSubject<Blueprint[]> = new BehaviorSubject<Blueprint[]>([]);
  _blueprintWirings$: BehaviorSubject<Partial<BlueprintWiring>[]> = new BehaviorSubject<Partial<BlueprintWiring>[]>([]);
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
      filterEmit(this._blueprintWirings$, wiring => wiring.input!.getIdentifier() !== portControl.getIdentifier());
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
    filterEmit(this._blueprintWirings$, (wiring) => wiring.input !== portControl);
    appendEmit(this._blueprintWirings$, {input: portControl});
  }

  handleClickOutputPort(portControl: PortControlComponent) {
    filterEmit(this._blueprintWirings$, (wiring) => wiring.output !== portControl);
    appendEmit(this._blueprintWirings$, {output: portControl});
  }

  @HostListener("mouseup", ["$event"])
  private handleMouseUp(event: MouseEvent) {
    const target = event.target as Element;
    if (target.classList.contains("port-circle") && (target.classList.contains("input") ? this.wiringInputNeeded() : this.wiringOutputNeeded())) {
      const targetPortControl: PortControlComponent = this.blueprintComponents
        .map((blueprintComponent) => target.classList.contains("input") ? blueprintComponent.getInputPortControl(target.id) : blueprintComponent.getOutputPortControl(target.id))
        .find(portControl => !!portControl)!;
            
      filterEmit(this._blueprintWirings$, (wiring) => wiring.input?.getIdentifier() !== targetPortControl.getIdentifier() && wiring.output?.getIdentifier() !== targetPortControl.getIdentifier());
      mapEmit(this._blueprintWirings$, (wiring) => {
        if (targetPortControl.isInput() && !wiring.input && !!wiring.output) {
          return {...wiring, input: targetPortControl};
        } else if (targetPortControl.isOutput() && !wiring.output && !!wiring.input) {
          return {...wiring, output: targetPortControl};
        } else {
          return wiring;
        }
      });
    } else {
      filterEmit(this._blueprintWirings$, (wiring) => !!wiring.input && !!wiring.output);
    }
  }

  private wiringInputNeeded() {
    return this._blueprintWirings$.getValue().some(wiring => !!wiring.output && !wiring.input)
  }

  private wiringOutputNeeded() {
    return this._blueprintWirings$.getValue().some(wiring => !!wiring.input && !wiring.output)
  }
}

interface BlueprintWiring {
  input: PortControlComponent,
  output: PortControlComponent
};