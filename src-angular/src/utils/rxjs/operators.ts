import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function mapArray<T>(mapper: (item: T) => T) {
    return function(source: Observable<T[]>): Observable<T[]> {
        return source.pipe(
            map(items => items.map(mapper)),
        );
    }
}

export function filterArray<T>(predicate: (item: T) => boolean) {
    return function(source: Observable<T[]>): Observable<T[]> {
        return source.pipe(
            map(items => items.filter(predicate)),
        );
    }
}