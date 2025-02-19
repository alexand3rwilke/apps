// Copyright 2017-2023 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

/// <reference types="@polkadot/dev-test/globals" />

import type { KeyringJson } from '@polkadot/ui-keyring/types';

import * as tmp from 'tmp';

import { FileStore } from '@polkadot/ui-keyring/stores';

import { accountStoreIpcHandler } from './account-store.js';
import { IpcMainHandler } from './ipc-main-handler.js';

const exampleAccount = (address: string): KeyringJson => ({
  address,
  meta: {}
});

describe('Account store', () => {
  let accountStore: IpcMainHandler;
  let tmpDir: tmp.DirResult;

  beforeEach(() => {
    tmpDir = tmp.dirSync({ unsafeCleanup: true });
    accountStore = accountStoreIpcHandler(new FileStore(tmpDir.name));
  });

  afterEach(() => {
    tmpDir.removeCallback();
  });

  it('all returns empty array at first', () => {
    expect(accountStore['account-store-all']()).toEqual([]);
  });

  it('after adding accounts, they become visible', async () => {
    await accountStore['account-store-set']('1', exampleAccount('a'));
    await accountStore['account-store-set']('2', exampleAccount('b'));

    expect(accountStore['account-store-all']()).toEqual([{
      key: '1', value: exampleAccount('a')
    }, {
      key: '2', value: exampleAccount('b')
    }]);
  });

  it('get returns account if exists', async () => {
    await accountStore['account-store-set']('1', exampleAccount('a'));
    expect(await accountStore['account-store-get']('1')).toEqual(exampleAccount('a'));
  });

  it('get returns null if account does not exist', async () => {
    // jest.spyOn(console, 'error').mockImplementationOnce(() => { /**/ });

    expect(await accountStore['account-store-get']('1')).toEqual(null);
  });

  it('account disappears from list after it is removed', async () => {
    // jest.spyOn(console, 'error').mockImplementationOnce(() => { /**/ });

    await accountStore['account-store-set']('1', exampleAccount('a'));
    await accountStore['account-store-remove']('1');

    expect(await accountStore['account-store-get']('1')).toEqual(null);
    expect(accountStore['account-store-all']()).toEqual([]);
  });
});
