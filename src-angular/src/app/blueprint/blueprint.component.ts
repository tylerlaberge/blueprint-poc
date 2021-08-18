import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-blueprint',
  templateUrl: './blueprint.component.html',
  styleUrls: ['./blueprint.component.scss']
})
export class BlueprintComponent implements OnInit {

  private grabbing: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  grab() {
    this.grabbing = true;
  }

  release() {
    this.grabbing = false;
  }

  isGrabbing() {
    return this.grabbing;
  }
}
