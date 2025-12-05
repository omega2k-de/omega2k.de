import { Injectable } from '@angular/core';

export interface RuntimesInterface {
  method?: string;
  start?: number;
  stop?: number;
  avg?: number;
  sequence: number[];
}

@Injectable({
  providedIn: 'root',
})
export class PerfService {
  private readonly keep = 1000;
  private readonly init: RuntimesInterface = { sequence: [] };
  private readonly store = new Map<CallableFunction, RuntimesInterface>();

  start(method: CallableFunction) {
    const data = this.getOrCreate(method);
    data.start = performance.now();
    this.store.set(method, data);
  }

  stop(method: CallableFunction) {
    const data = this.getOrCreate(method);
    if (data.start) {
      data.sequence.push(performance.now() - data.start);
      data.start = performance.now();
    }
    if (data.sequence.length > this.keep) {
      data.sequence.splice(0, data.sequence.length - this.keep);
    }
    this.store.set(method, data);
  }

  performance(method: CallableFunction): RuntimesInterface {
    const data = this.getOrCreate(method);
    return {
      ...data,
      stop: performance.now(),
      avg: data.sequence.length
        ? data.sequence.reduce((p, c) => p + c, 0) / data.sequence.length
        : 0,
      method: method.toString(),
    };
  }

  summary(): RuntimesInterface[] {
    return Array.from(this.store.entries()).map(([method, data]) => {
      return {
        ...data,
        stop: performance.now(),
        avg: data.sequence.length
          ? data.sequence.reduce((p, c) => p + c, 0) / data.sequence.length
          : 0,
        method: method.toString(),
      };
    });
  }

  private getOrCreate(method: CallableFunction): RuntimesInterface {
    return this.store.get(method) ?? { ...this.init };
  }
}
