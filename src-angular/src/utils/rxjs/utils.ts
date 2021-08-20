import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { mapArray } from './operators';

export function mutate<T>(source: Subject<T[]>, mutator: (item: T) => T): void {
    source.pipe(
        take(1),
        mapArray(mutator) 
    ).subscribe(items => source.next(items));
}