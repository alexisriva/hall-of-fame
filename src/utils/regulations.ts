export const REGULATIONS = ["Champions M-1"] as const;
export type Regulation = (typeof REGULATIONS)[number];
