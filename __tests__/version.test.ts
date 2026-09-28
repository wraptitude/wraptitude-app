import { compareVersions, getUpdateDecision, parseVersionPolicy, VersionPolicy } from '../src/update/version';

const policy: VersionPolicy = {
  enabled: true,
  minimumVersion: '1.2.0',
  latestVersion: '1.4.0',
  storeUrl: 'https://apps.apple.com/ca/app/wraptitude/id6745419316',
  message: '',
};

describe('app version policy', () => {
  it('compares numeric segments rather than strings', () => {
    expect(compareVersions('1.10.0', '1.9.9')).toBe(1);
    expect(compareVersions('1.2', '1.2.0')).toBe(0);
    expect(compareVersions('invalid', '1.2.0')).toBeNull();
  });

  it('requires an update below the minimum version', () => {
    expect(getUpdateDecision('1.1.9', 'ios', policy)?.kind).toBe('force');
  });

  it('offers an optional update below the latest version', () => {
    expect(getUpdateDecision('1.2.0', 'ios', policy)?.kind).toBe('optional');
    expect(getUpdateDecision('1.4.0', 'ios', policy)).toBeNull();
  });

  it('does not lock users with a disabled or unsafe policy', () => {
    expect(getUpdateDecision('1.0.0', 'ios', { ...policy, enabled: false })).toBeNull();
    expect(getUpdateDecision('1.0.0', 'ios', { ...policy, storeUrl: 'https://example.com/app' })).toBeNull();
    expect(getUpdateDecision('1.0.0', 'ios', { ...policy, minimumVersion: '2.0.0' })).toBeNull();
    expect(parseVersionPolicy({ enabled: true })).toBeNull();
  });
});
