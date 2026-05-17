import { useContext } from 'react';
import { MarketDataContext } from './marketDataContext';

export function useMarketData() {
  return useContext(MarketDataContext);
}
