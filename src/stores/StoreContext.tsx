import React, { createContext, useContext } from 'react';
import { rootStore, RootStoreType } from './rootStore';

const StoreContext = createContext<RootStoreType>(rootStore);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;

export const useStores = () => useContext(StoreContext);
