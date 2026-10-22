import { createContext, useContext } from 'react';
import { DEFAULT_SETTINGS } from './defaults';

// Site settings are fetched once in App and shared here, so pages don't refetch them.
// Until Sanity responds, consumers see the defaults (the original hardcoded content).
export const SettingsContext = createContext(DEFAULT_SETTINGS);

export const useSettings = () => useContext(SettingsContext);
