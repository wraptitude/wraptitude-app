export interface VersionPolicy {
  enabled: boolean;
  minimumVersion: string;
  latestVersion: string;
  storeUrl: string;
  message: string;
}

export type UpdateKind = 'force' | 'optional';

export interface UpdateDecision {
  kind: UpdateKind;
  latestVersion: string;
  storeUrl: string;
  message: string;
}

export function parseVersionPolicy(value: unknown): VersionPolicy | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const policy = value as Partial<VersionPolicy>;
  if (
    typeof policy.enabled !== 'boolean' ||
    typeof policy.minimumVersion !== 'string' ||
    typeof policy.latestVersion !== 'string' ||
    typeof policy.storeUrl !== 'string' ||
    typeof policy.message !== 'string'
  ) {
    return null;
  }
  return policy as VersionPolicy;
}

function parseVersion(value: string): number[] | null {
  if (!/^\d+(?:\.\d+){0,3}$/.test(value)) {
    return null;
  }
  return value.split('.').map(Number);
}

export function compareVersions(left: string, right: string): number | null {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);
  if (!leftParts || !rightParts) {
    return null;
  }
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) {
      return Math.sign(difference);
    }
  }
  return 0;
}

export function getUpdateDecision(
  installedVersion: string,
  platform: 'ios' | 'android',
  policy: VersionPolicy,
): UpdateDecision | null {
  const trustedStore = platform === 'ios' ? 'apps.apple.com' : 'play.google.com';
  const policyRange = compareVersions(policy.minimumVersion, policy.latestVersion);
  if (
    !policy.enabled ||
    !policy.storeUrl.startsWith(`https://${trustedStore}/`) ||
    policyRange === null ||
    policyRange > 0
  ) {
    return null;
  }
  const minimumComparison = compareVersions(installedVersion, policy.minimumVersion);
  const latestComparison = compareVersions(installedVersion, policy.latestVersion);
  if (minimumComparison === null || latestComparison === null || latestComparison >= 0) {
    return null;
  }
  return {
    kind: minimumComparison < 0 ? 'force' : 'optional',
    latestVersion: policy.latestVersion,
    storeUrl: policy.storeUrl,
    message: policy.message,
  };
}
