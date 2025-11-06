/* eslint-disable @typescript-eslint/no-namespace */

export namespace Heater {
  export type Paths = import("./heater").paths;
  export type Components = import("./heater").components;
  export type Operations = import("./heater").operations;
}

export namespace LGG {
  export type Paths = import("./lgg").paths;
  export type Components = import("./lgg").components;
  export type Operations = import("./lgg").operations;
}

export namespace RiceShower {
  export type Paths = import("./rice-shower").paths;
  export type Components = import("./rice-shower").components;
  export type Operations = import("./rice-shower").operations;
}

export namespace Simulator {
  export type Paths = import("./simulator").paths;
  export type Components = import("./simulator").components;
  export type Operations = import("./simulator").operations;
}
