"use client";

import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import store from "../redux/store";

interface ReduxProviderProps {
  children: React.ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }
  return <Provider store={store}>{children}</Provider>;
}
