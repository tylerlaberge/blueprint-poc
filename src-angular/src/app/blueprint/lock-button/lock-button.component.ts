import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'lock-button',
  templateUrl: './lock-button.component.html',
  styleUrls: ['./lock-button.component.scss']
})
export class LockButtonComponent {

    _locked$ = new BehaviorSubject<boolean>(false);

    @Input() set locked(value: boolean) { this._locked$.next(value); };

    @Output() onToggleLock = new EventEmitter<void>();

    clickLockButton() {
      this.onToggleLock.emit();
    }
}