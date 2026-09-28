import React from 'react';
import {Text} from 'react-native';
import TestRenderer, {act} from 'react-test-renderer';
import {BranchProvider, useBranch} from '../src/branch/BranchContext';
import {branchApi} from '../src/branch/api';

jest.mock('../src/branch/api', () => ({branchApi: jest.fn()}));
const api = branchApi as jest.Mock;
function Account() {
  const value = useBranch();
  return <Text>{JSON.stringify(value)}</Text>;
}

describe('fixed account branch', () => {
  let renderer: TestRenderer.ReactTestRenderer;
  afterEach(async () => {
    if (renderer) await act(async () => renderer.unmount());
    api.mockReset();
  });
  it.each(['markham', 'vaughan'])('uses the verified %s account branch, with no switch action', async branchId => {
    api.mockResolvedValue({branchId});
    await act(async () => {renderer = TestRenderer.create(<BranchProvider><Account /></BranchProvider>);});
    const text = JSON.stringify(renderer.toJSON());
    expect(api).toHaveBeenCalledWith('/customer/account');
    expect(text).toContain(branchId);
    expect(text).not.toContain('setBranchId');
  });
  it('does not fall back to Markham or render customer data when account lookup fails', async () => {
    api.mockRejectedValue(new Error('offline'));
    await act(async () => {renderer = TestRenderer.create(<BranchProvider><Account /></BranchProvider>);});
    expect(renderer.root.findAllByType(Account)).toHaveLength(0);
    expect(JSON.stringify(renderer.toJSON())).toContain('Unable to verify your account location');
  });
  it('does not accept an invalid backend branch', async () => {
    api.mockResolvedValue({branchId: 'invalid'});
    await act(async () => {renderer = TestRenderer.create(<BranchProvider><Account /></BranchProvider>);});
    expect(renderer.root.findAllByType(Account)).toHaveLength(0);
  });
});
