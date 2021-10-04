import { Component, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Blueprint } from 'src/types/blueprint';
import { BlueprintComponent } from '../blueprint/blueprint.component';
import { v4 as uuid } from 'uuid';
import { PortControlComponent } from '../blueprint/port/port-control/port-control.component';
import { appendEmit, filterEmit, mapEmit } from 'src/utils/rxjs/utils';
import { concatAll } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  _blueprints$: BehaviorSubject<Blueprint[]> = new BehaviorSubject<Blueprint[]>([]);
  _blueprintWirings$: BehaviorSubject<Partial<BlueprintWiring>[]> = new BehaviorSubject<Partial<BlueprintWiring>[]>([]);
  _refreshWirings$: Subject<void> = new Subject();

  _appendWiring$: Subject<Partial<BlueprintWiring>> = new Subject();
  _removeWiring$: Subject<string> = new Subject();

  _contextMenuPosition$: BehaviorSubject<{x: number, y: number}> = new BehaviorSubject<{x: number, y: number}>({x: 0, y: 0});

  @ViewChildren(BlueprintComponent) blueprintComponents!: QueryList<BlueprintComponent>;
  @ViewChild(MatMenuTrigger) editorMenu!: MatMenuTrigger;

  constructor() { }

  ngOnInit(): void {
    let blueprintA: Blueprint = {id: uuid(), title: 'Blueprint', position: {x: 400, y: 500}, inputs: [
      {id: uuid(), direction: 'input', datatype: 'number'},
      {id: uuid(), direction: 'input', datatype: 'string'},
    ], outputs: [
      {id: uuid(), direction: 'input', datatype: 'bool'},
      {id: uuid(), direction: 'input', datatype: 'object'},
    ]};
    let blueprintB: Blueprint = {id: uuid(), title: 'Blueprint', position: {x: 1200, y: 700}, inputs: [
      {id: uuid(), direction: 'output', datatype: 'bool'},
      {id: uuid(), direction: 'output', datatype: 'bool'},
    ], outputs: []};

    this._blueprints$.next([blueprintA, blueprintB]);

    // When appendWiring$ emits, append the wiring to the blueprintWirings$
    this._appendWiring$.subscribe(wiring => {
      appendEmit(this._blueprintWirings$, wiring);
    });

    // When removeWiring$ emits, filter out the wiring which has an input or output port equal to the emitted port id and unhide the wiring's no longer connected ports
    this._removeWiring$.subscribe(portId => {
      filterEmit(this._blueprintWirings$, (wiring) => {
        if (wiring.input?.getIdentifier() === portId || wiring.output?.getIdentifier() === portId) {
          wiring.input?.unhidePort();
          wiring.output?.unhidePort();
          return false;
        } else {
          return true;
        }
      });
    })

    // When blueprintWirings$ change, make sure all the connected input/output ports are hidden
    this._blueprintWirings$
      .pipe(concatAll())
      .subscribe(wiring => {
        wiring.input?.hidePort();
        wiring.output?.hidePort();
      });

    // When blueprintWirings$ are changed, notify all wiring to refresh (on a timeout so that this runs after all other subscriptions have finished executing, important in the case of a port/wire being deleted)
    this._blueprintWirings$.subscribe(() => setTimeout(() => this._refreshWirings$.next()));
  }

  handleBlueprintMove(blueprintId: string) {
    this._refreshWirings$.next();
  }

  handleDestroyInputPort(portControl: PortControlComponent) {
    setTimeout(() => this._removeWiring$.next(portControl.getIdentifier()));
  }

  handleDestroyOutputPort(portControl: PortControlComponent) {
    setTimeout(() => this._removeWiring$.next(portControl.getIdentifier()));
  }

  handleClickInputPort(portControl: PortControlComponent) {
    // remove any wiring that is already connected to this port
    this._removeWiring$.next(portControl.getIdentifier());
    // append a partial wiring to the input port
    this._appendWiring$.next({input: portControl});
  }

  handleClickOutputPort(portControl: PortControlComponent) {
    // remove any wiring that is already connected to this port
    this._removeWiring$.next(portControl.getIdentifier());
    // append a partial wiring to the output port
    this._appendWiring$.next({output: portControl});
  }

  createNewBlueprint(e: MouseEvent) {
    appendEmit(this._blueprints$, {id: uuid(), title: 'Blueprint', position: {x: e.clientX - 50, y: e.clientY - 25}, inputs: [], outputs: []});
  }

  openPreferences() {
    console.warn("PREFERENCES");
  }

  @HostListener("contextmenu", ["$event"])
  private handleRightClick(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this._contextMenuPosition$.next({x: event.clientX, y: event.clientY});
    this.editorMenu.openMenu();
  }

  @HostListener("mouseup", ["$event"])
  private handleMouseUp(event: MouseEvent) {
    const target = event.target as Element;
    // check if incomplete wiring exists  
    const wiring = this._blueprintWirings$.getValue().find(wiring => !wiring.input || !wiring.output);
    if (wiring) {
      // the needed ending port direction for the wiring
      const wireEndDirection = !!wiring.input ? 'output' : 'input'
      // the wiring's datatype
      const wireDatatype = wiring.input?.getDataType() || wiring.output?.getDataType();
      // if the target is a port and is not locked and is the proper direction / datatype for the incomplete wiring
      if (target.classList.contains("port-circle") && !target.classList.contains("locked") && target.classList.contains(wireEndDirection) && target.classList.contains(wireDatatype!)) { 
        // grab the PortControlComponent associated with the target element
        const targetPortControl: PortControlComponent = this.blueprintComponents
          .map((blueprintComponent) => target.classList.contains("input") ? blueprintComponent.getInputPortControl(target.id) : blueprintComponent.getOutputPortControl(target.id))
          .find(portControl => !!portControl)!;
        // remove any existing wirings attached to the target port
        this._removeWiring$.next(targetPortControl.getIdentifier());
        // update the incomplete wiring to connect to the target port
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
        // otherwise remove incomplete wiring if it exists
        const incompleteWiring = this._blueprintWirings$.getValue().find(wiring => !wiring.input || !wiring.output);
        if (incompleteWiring) {
          this._removeWiring$.next(wiring.input?.getIdentifier() || wiring.output?.getIdentifier());
        }
      }
    }
  }
}

interface BlueprintWiring {
  input: PortControlComponent,
  output: PortControlComponent
};