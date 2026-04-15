export const REGULATIONS = ["Set M-A"] as const;
export type Regulation = (typeof REGULATIONS)[number];
