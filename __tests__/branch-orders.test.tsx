import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {Alert} from 'react-native';
import ServiceTracking from '../src/screens/ServiceTracking';
import {branchApi} from '../src/branch/api';
import {BRANCHES as mockBranches, BranchId} from '../src/branch/config';

let mockBranchId: BranchId = 'markham';
jest.mock('../src/branch/BranchContext', () => ({
  useBranch: () => ({branchId: mockBranchId, branch: mockBranches[mockBranchId]}),
}));
jest.mock('../src/branch/api', () => ({branchApi: jest.fn()}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}));
jest.mock('@react-native-picker/picker', () => {
  const ReactModule = require('react');
  const Picker = (props: object) => ReactModule.createElement('OrderPicker', props);
  Picker.Item = (props: object) => ReactModule.createElement('OrderOption', props);
  return {Picker};
});
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-linear-gradient', () => 'Gradient');
jest.mock('react-native-fast-image', () => 'FastImage');

const api = branchApi as jest.Mock;
const order = (ID: string, branchId: BranchId, createAt: string, vehicleMake: string, step5 = 'pending') => ({
  ID, branchId, createAt, vehicleMake, vehicleModel: 'Test model', vehicleYear: '2026',
  serviceType: 'full_wrap', step0: 'pending', step5,
});

describe('branch order tracking', () => {
  let renderer: TestRenderer.ReactTestRenderer;
  beforeEach(() => {
    jest.useFakeTimers();
    mockBranchId = 'markham';
    api.mockReset();
  });
  afterEach(async () => {
    if (renderer) await act(async () => renderer.unmount());
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  const render = async () => {
    await act(async () => { renderer = TestRenderer.create(<ServiceTracking />); });
  };
  const picker = () => renderer.root.findByType('OrderPicker' as React.ElementType);
  const text = () => JSON.stringify(renderer.toJSON());

  it('defaults to newest order but lets the customer select another order in the same branch', async () => {
    api.mockResolvedValue([
      order('older-order', 'markham', '2026-08-01', 'Older vehicle', 'completed'),
      order('newer-order', 'markham', '2026-09-01', 'Newer vehicle'),
    ]);
    await render();
    expect(api).toHaveBeenCalledWith('/customer/services?branchId=markham');
    expect(picker().props.selectedValue).toBe('newer-order');
    await act(async () => picker().props.onValueChange('older-order'));
    expect(picker().props.selectedValue).toBe('older-order');
    expect(text()).toContain('Older vehicle');
    expect(text()).toContain('Orders belong to your registered branch: ');
  });

  it('clears the previous account orders when account context changes', async () => {
    api.mockResolvedValueOnce([order('markham-order', 'markham', '2026-09-01', 'Markham car')]);
    await render();
    let resolveVaughan!: (value: unknown) => void;
    api.mockImplementationOnce(() => new Promise(resolve => { resolveVaughan = resolve; }));
    mockBranchId = 'vaughan';
    await act(async () => renderer.update(<ServiceTracking />));
    expect(text()).not.toContain('markham-order');
    await act(async () => resolveVaughan([]));
    expect(text()).toContain('Vaughan');
    expect(text()).toContain('No ');
    expect(text()).not.toContain('markham-order');
  });

  it('ignores a stale response arriving after a branch switch', async () => {
    let resolveMarkham!: (value: unknown) => void;
    api.mockImplementationOnce(() => new Promise(resolve => { resolveMarkham = resolve; }));
    await render();
    mockBranchId = 'vaughan';
    api.mockResolvedValueOnce([order('vaughan-order', 'vaughan', '2026-09-01', 'Vaughan car')]);
    await act(async () => renderer.update(<ServiceTracking />));
    await act(async () => resolveMarkham([order('stale-markham', 'markham', '2026-09-02', 'Old car')]));
    expect(picker().props.selectedValue).toBe('vaughan-order');
    expect(text()).not.toContain('stale-markham');
  });

  it('does not render a response containing another branch order', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    api.mockResolvedValue([order('wrong-branch-order', 'vaughan', '2026-09-01', 'Other car')]);
    await render();
    expect(text()).not.toContain('wrong-branch-order');
    expect(text()).toContain('Unable to load orders');
  });
});
