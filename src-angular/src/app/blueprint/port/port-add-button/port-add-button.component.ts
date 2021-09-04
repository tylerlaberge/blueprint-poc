import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'port-add-button',
  templateUrl: './port-add-button.component.html',
  styleUrls: ['./port-add-button.component.scss']
})
export class PortAddButtonComponent {

    _locked$ = new BehaviorSubject<boolean>(false);
    _direction$ = new BehaviorSubject<'input' | 'output' | null>(null);

    @Input() set locked(value: boolean) { this._locked$.next(value); };
    @Input() set direction(value: 'input' | 'output') { this._direction$.next(value); };

    @Output() onAddPort = new EventEmitter<void>();

    @HostListener("mousedown", ["$event"])
    private stopPropagation(event: Event) {
      if (!this._locked$.getValue()) {
        event.stopPropagation();
        event.preventDefault();
      }
    }

    clickAddButton() {
        this.onAddPort.emit();
    }

    isInput(): boolean {
      return this._direction$.getValue() === 'input';
    }
  
    isOutput(): boolean {
      return this._direction$.getValue() === 'output';
    }
}