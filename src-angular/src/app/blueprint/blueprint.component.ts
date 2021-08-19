import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-blueprint',
  templateUrl: './blueprint.component.html',
  styleUrls: ['./blueprint.component.scss']
})
export class BlueprintComponent implements OnInit {

  public isDragging$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public inputs$: BehaviorSubject<Port[]> = new BehaviorSubject<Port[]>([]);
  public outputs$: BehaviorSubject<Port[]> = new BehaviorSubject<Port[]>([]);

  constructor() { }

  ngOnInit(): void {
  }

  grab() {
    this.isDragging$.next(true);
  }

  release() {
    this.isDragging$.next(false);
  }
  
  addInput() {
    let currentInputs = this.inputs$.getValue();
    this.inputs$.next([...currentInputs, {direction: 'input', type: 'foo'}]);
  }

  addOutput() {
    let currentOutputs = this.outputs$.getValue();
    this.outputs$.next([...currentOutputs, {direction: 'output', type: 'bar'}]);
  }
}

export interface Port {
  direction: 'input' | 'output';
  type: string;
}
