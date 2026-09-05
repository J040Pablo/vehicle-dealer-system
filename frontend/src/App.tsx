import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { DealerList } from '@/features/dealers/DealerList';
import { VehicleList } from '@/features/vehicles/VehicleList';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dealers" replace />} />
              <Route path="/dealers" element={<DealerList />} />
              <Route path="/vehicles" element={<VehicleList />} />
              <Route path="*" element={<Navigate to="/dealers" replace />} />
            </Routes>
          </main>
          <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
            Vehicle Dealer System &copy; 2026 – Desafio Técnico Fullstack
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
