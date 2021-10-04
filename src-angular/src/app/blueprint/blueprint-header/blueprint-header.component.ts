import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'blueprint-header',
  templateUrl: './blueprint-header.component.html',
  styleUrls: ['./blueprint-header.component.scss']
})
export class BlueprintHeaderComponent {

    _locked$ = new BehaviorSubject<boolean>(false);
    _title$ = new BehaviorSubject<string>("");

    @Input() set locked(value: boolean) { this._locked$.next(value); };
    @Input() set title(value: string) { this._title$.next(value); };

    @Output() onToggleLock = new EventEmitter<void>();
    @Output() onChangeTitle = new EventEmitter<string>();

    clickLockButton() {
      this.onToggleLock.emit();
    }

    changeTitle(title: string) {
      this.onChangeTitle.emit(title);
    }
}