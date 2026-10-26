const blockedTerms = [
  'nude',
  'naked',
  'topless',
  'explicit',
  'porn',
  'sexual',
  'gore',
  'violence',
  'hate',
  'attack',
  'kill',
];

export function moderationCheck(value: string) {
  const normalized = value.toLowerCase();
  const match = blockedTerms.find((term) => normalized.includes(term));

  if (!match) {
    return { isAllowed: true, reason: null };
  }

  return {
    isAllowed: false,
    reason: `Mi Moda blocks nudity and harmful language. Remove “${match}” and keep the post fashion-focused.`,
  };
}
