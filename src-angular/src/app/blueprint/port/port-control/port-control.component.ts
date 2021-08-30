import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Port, PortType } from 'src/types/blueprint';
import { PortCircleComponent } from '../port-circle/port-circle.component';

@Component({
  selector: 'port-control',
  templateUrl: './port-control.component.html',
  styleUrls: ['./port-control.component.scss']
})
export class PortControlComponent implements OnDestroy {

    _port$ = new BehaviorSubject<Port | null>(null);
    _locked$ = new BehaviorSubject<boolean>(false);

    @Input() set port(value: Port) { this._port$.next(value); };
    @Input() set locked(value: boolean) { this._locked$.next(value); };

    @Output() onSelectDatatype = new EventEmitter<PortType>();
    @Output() onDeletePort = new EventEmitter<void>();
    @Output() onDestroy = new EventEmitter<void>();

    @ViewChild(PortCircleComponent) _portCircleComponent!: PortCircleComponent;

    ngOnDestroy() {
        this.onDestroy.emit();
    }

    getIdentifier() {
        return this._port$.getValue()?.id;
    }

    getPortElement(): HTMLElement {
        return this._portCircleComponent.elementRef.nativeElement;
    }

    selectDatatype(datatype: PortType) {
        this.onSelectDatatype.emit(datatype);
    }

    deletePort() {
        this.onDeletePort.emit();
    }

    isInput(): boolean {
        return this._port$.getValue()?.direction === 'input';
    }
    
    isOutput(): boolean {
        return this._port$.getValue()?.direction === 'output';
    }
}