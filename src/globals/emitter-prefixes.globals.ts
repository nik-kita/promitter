export const PREFIX_DELIMITER = '___' as const;
export const COMPLETE_PREFIX = 'complete___' as const;
export const REJECT_PREFIX = 'reject___' as const;
export const ALL_PREFIXES = [
  COMPLETE_PREFIX,
  REJECT_PREFIX,
];
