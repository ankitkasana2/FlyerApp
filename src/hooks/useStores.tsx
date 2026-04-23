import React from 'react';
import { rootStore } from '../stores/rootStore';

const StoreContext = React.createContext(rootStore);

export const StoreProvider = ({ children }: any) => {
  return (
    <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
  );
};

export const useStores = () => React.useContext(StoreContext);
