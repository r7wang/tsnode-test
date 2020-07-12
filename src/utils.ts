const DEFAULT_DELAY = 1000;

export interface Counter {
    value: number;
}

// Acts like an asynchronous sleep function.
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function incrementalDelay(id: number): number {
    return DEFAULT_DELAY - (id * 50);
}

function staticDelay(delayMs: number): (id: number) => number {
    return (id: number) => {
        return delayMs;
    };
}

export function now(): string {
    return new Date().toISOString();
}

export function log(message?: string): void {
    if (message) {
        console.log(`${now()}: ${message}`)
    } else {
        console.log(`${now()}`);
    }
}

export async function processItemIncrementalDelay(
    id: number,
    counter?: Counter,
    errorIdx?: number,
): Promise<number> {
    return processItem(id, counter, incrementalDelay, errorIdx);
}

export async function processItemNoDelay(
    id: number,
    counter?: Counter,
    errorIdx?: number,
): Promise<number> {
    return processItem(id, counter, undefined, errorIdx);
}

export async function processItemStaticDelay(
    id: number,
    counter?: Counter,
    errorIdx?: number,
): Promise<number> {
    return processItem(id, counter, staticDelay(DEFAULT_DELAY), errorIdx);
}

async function processItem(
    id: number,
    counter?: Counter,
    delayFunc?: (n: number) => number,
    errorIdx?: number,
): Promise<number> {
    log(`start ${id}`);
    if (delayFunc) {
        const delayMs = delayFunc(id);
        await delay(delayMs);
    }

    if (errorIdx && id == errorIdx) {
        throw new Error("reject");
    }
    if (counter) {
        counter.value += 1;
    }
    log(`done ${id}`);
    return id;
}
