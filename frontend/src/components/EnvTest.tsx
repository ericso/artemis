import React from 'react';

export const EnvTest: React.FC = () => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Environment Variables Test</h2>
      <div className="space-y-2">
        <p>
          <span className="font-medium">API URL: </span>
          <code className="bg-gray-200 px-2 py-1 rounded">{import.meta.env.VITE_API_URL}</code>
        </p>
        <p>
          <span className="font-medium">App URL: </span>
          <code className="bg-gray-200 px-2 py-1 rounded">{import.meta.env.VITE_APP_URL}</code>
        </p>
        <p>
          <span className="font-medium">Mode: </span>
          <code className="bg-gray-200 px-2 py-1 rounded">{import.meta.env.MODE}</code>
        </p>
      </div>
    </div>
  );
}; 