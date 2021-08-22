export interface Blueprint {
    id: string;
    position: Coordinates;
    inputs: Port[];
    outputs: Port[];
}

export interface Port {
    id: string;
    direction: 'input' | 'output';
    datatype: PortType;
    connection?: Port;
}

export interface Coordinates {
    x: number,
    y: number
}

export type PortType = 'string' | 'number' | 'bool' | 'object';