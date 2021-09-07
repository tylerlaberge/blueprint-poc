import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'sass-helper',
    templateUrl: './sass-helper.component.html',
    styleUrls: ['./sass-helper.component.scss']
})
export class SassHelperComponent {

    @ViewChild('styles')
    private elementRef!: ElementRef

    readProperty(name: string): string {
        const styles = window.getComputedStyle(this.elementRef.nativeElement);
        return styles.getPropertyValue('--' + name);
    }
}