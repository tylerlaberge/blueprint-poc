import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'blueprint-title',
  templateUrl: './blueprint-title.component.html',
  styleUrls: ['./blueprint-title.component.scss']
})
export class BlueprintTitleComponent {

  _locked$ = new BehaviorSubject<boolean>(false);
  _title$ = new BehaviorSubject<string>("");

  @Input() set locked(value: boolean) { this._locked$.next(value); };
  @Input() set title(value: string) { this._title$.next(value); };

  @Output() onChangeTitle: EventEmitter<string> = new EventEmitter();

  @HostListener("mousedown", ["$event"])
  private stopPropagation(event: Event) {
    if (!this._locked$.getValue()) {
      event.stopPropagation();
    }
  }

  handleTitleChange(e: Event) {
    const title = (e.target as HTMLInputElement).value;
    this.onChangeTitle.emit(title);
  }
}