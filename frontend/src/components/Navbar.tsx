import React from 'react';
import { NavLink } from 'react-router-dom';
import { Car, Building2, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-sky-600 p-2 rounded-lg text-white shadow-lg shadow-sky-600/30">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">VehicleDealer</span>
              <span className="text-xs block text-sky-400 font-medium">Gestão Comercial</span>
            </div>
          </div>

          <nav className="flex space-x-2">
            <NavLink
              to="/dealers"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Building2 className="h-4 w-4" />
              <span>Concessionárias</span>
            </NavLink>

            <NavLink
              to="/vehicles"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Car className="h-4 w-4" />
              <span>Veículos</span>
            </NavLink>
          </nav>

          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>ViaCEP Auto-Fill Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
