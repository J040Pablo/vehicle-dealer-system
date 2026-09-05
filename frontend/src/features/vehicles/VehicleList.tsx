import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '@/services/vehicleService';
import { dealerService } from '@/services/dealerService';
import { Vehicle } from '@/types/vehicle';
import { VehicleFormModal } from './VehicleFormModal';
import { VehicleFormData } from './VehicleSchema';
import { Car, Plus, Filter, Trash2, Edit3, Loader2, AlertCircle, Building2, Fuel, Calendar } from 'lucide-react';

export const VehicleList: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDealerFilter, setSelectedDealerFilter] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles', selectedDealerFilter],
    queryFn: () => vehicleService.getAll(selectedDealerFilter),
  });

  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealerService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: vehicleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      setIsModalOpen(false);
      setErrorMessage(null);
    },
    onError: (err: Error) => setErrorMessage(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: VehicleFormData }) => vehicleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      setIsModalOpen(false);
      setSelectedVehicle(null);
      setErrorMessage(null);
    },
    onError: (err: Error) => setErrorMessage(err.message),
  });

  const associateMutation = useMutation({
    mutationFn: ({ vehicleId, dealerId }: { vehicleId: number; dealerId: number }) =>
      vehicleService.associateDealer(vehicleId, dealerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
    },
    onError: (err: Error) => setErrorMessage(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: vehicleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
    },
    onError: (err: Error) => setErrorMessage(err.message),
  });

  const handleOpenCreate = () => {
    setSelectedVehicle(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: VehicleFormData) => {
    if (selectedVehicle) {
      await updateMutation.mutateAsync({ id: selectedVehicle.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAssociateChange = (vehicleId: number, targetDealerIdStr: string) => {
    if (!targetDealerIdStr) return;
    associateMutation.mutate({ vehicleId, dealerId: Number(targetDealerIdStr) });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Car className="w-7 h-7 text-sky-500" /> Catálogo de Veículos
          </h1>
          <p className="text-sm text-slate-400">
            Cadastre, pesquise e vincule veículos às concessionárias cadastradas no sistema.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-sky-600/30"
        >
          <Plus className="w-4 h-4" /> Novo Veículo
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-sky-400" />
          <span className="text-sm font-medium text-slate-300">Filtrar por Concessionária:</span>
        </div>
        <select
          value={selectedDealerFilter ?? ''}
          onChange={(e) => setSelectedDealerFilter(e.target.value ? Number(e.target.value) : undefined)}
          className="w-full sm:w-80 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="">Todas as Concessionárias</option>
          {dealers.map((dealer) => (
            <option key={dealer.id} value={dealer.id}>
              {dealer.name}
            </option>
          ))}
        </select>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoadingVehicles ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
          <span>Carregando veículos...</span>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl space-y-3">
          <Car className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">Nenhum veículo encontrado</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Não há veículos para o filtro selecionado. Adicione novos veículos ou selecione outro filtro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                      {vehicle.brand}
                    </span>
                    <h3 className="font-bold text-white text-xl">{vehicle.model}</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-md font-mono font-bold">
                    {vehicle.plate}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ano: <strong>{vehicle.year}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{vehicle.fuelType}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" /> Concessionária:
                  </span>
                  {vehicle.dealerName ? (
                    <div className="text-sky-300 font-medium bg-sky-950/30 border border-sky-800/40 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                      <span className="truncate">{vehicle.dealerName}</span>
                    </div>
                  ) : (
                    <div className="text-amber-400 font-medium bg-amber-950/30 border border-amber-800/40 px-2.5 py-1.5 rounded-lg">
                      Não vinculada
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <select
                  value={vehicle.dealerId ?? ''}
                  onChange={(e) => handleAssociateChange(vehicle.id, e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2 py-1 text-xs focus:outline-none"
                >
                  <option value="">Alterar vínculo...</option>
                  {dealers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(vehicle)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-sky-400 rounded-md transition-colors"
                    title="Editar Veículo"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
                    title="Excluir Veículo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <VehicleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        vehicleToEdit={selectedVehicle}
        dealers={dealers}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
