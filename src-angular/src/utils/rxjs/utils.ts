import { Subject } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { mapArray, filterArray } from './operators';

export function mapEmit<T>(source: Subject<T[]>, mapper: (item: T) => T): void {
    source.pipe(
        take(1),
        mapArray(mapper) 
    ).subscribe(items => source.next(items));
}

export function filterEmit<T>(source: Subject<T[]>, predicate: (item: T) => boolean): void {
    source.pipe(
        take(1),
        filterArray(predicate) 
    ).subscribe(items => source.next(items));
}

export function appendEmit<T>(source: Subject<T[]>, item: T): void {
    source.pipe(
        take(1),
        map(items => [...items, item])
    ).subscribe(items => source.next(items));
}