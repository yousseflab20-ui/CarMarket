import { ExpoRoot } from 'expo-router';
import React from 'react';

export default function App() {
  const ctx = require.context('./src/app');
  return <ExpoRoot context={ctx} />;
}
