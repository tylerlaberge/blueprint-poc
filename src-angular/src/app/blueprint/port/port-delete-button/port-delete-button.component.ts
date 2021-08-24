import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'port-delete-button',
  templateUrl: './port-delete-button.component.html',
  styleUrls: ['./port-delete-button.component.scss']
})
export class PortDeleteButtonComponent {

    _locked$ = new BehaviorSubject<boolean>(false);

    @Input() set locked(value: boolean) { this._locked$.next(value); };
    @Output() onDeletePort = new EventEmitter<void>();

    clickDeleteButton() {
        this.onDeletePort.emit();
    }
}