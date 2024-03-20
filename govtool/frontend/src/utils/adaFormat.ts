const LOVELACE = 1000000;
const DECIMALS = 6;

export const correctAdaFormat = (lovelace: number | undefined) => (lovelace
  ? Number.parseFloat((lovelace / LOVELACE).toFixed(DECIMALS))
  : 0);
