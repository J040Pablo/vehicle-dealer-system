import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleSchema, VehicleFormData } from './VehicleSchema';
import { Vehicle, FuelType } from '@/types/vehicle';
import { Dealer } from '@/types/dealer';
import { X, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  vehicleToEdit?: Vehicle | null;
  dealers: Dealer[];
  isLoading: boolean;
}

const fuelTypes: { label: string; value: FuelType }[] = [
  { label: 'Flex (Gasolina / Etanol)', value: 'FLEX' },
  { label: 'Gasolina', value: 'GASOLINA' },
  { label: 'Etanol', value: 'ETANOL' },
  { label: 'Diesel', value: 'DIESEL' },
  { label: 'Elétrico', value: 'ELETRICO' },
  { label: 'Híbrido', value: 'HIBRIDO' },
];

export const VehicleFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  vehicleToEdit,
  dealers,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

  useEffect(() => {
    if (vehicleToEdit) {
      reset({
        brand: vehicleToEdit.brand,
        model: vehicleToEdit.model,
        year: vehicleToEdit.year,
        plate: vehicleToEdit.plate,
        fuelType: vehicleToEdit.fuelType,
        dealerId: vehicleToEdit.dealerId ?? null,
      });
    } else {
      reset({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        plate: '',
        fuelType: 'FLEX',
        dealerId: null,
      });
    }
  }, [vehicleToEdit, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <h3 className="text-lg font-semibold text-white">
            {vehicleToEdit ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Marca *
              </label>
              <input
                type="text"
                placeholder="Ex: Toyota, Honda"
                {...register('brand')}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              {errors.brand && <p className="text-xs text-rose-400 mt-1">{errors.brand.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Modelo *
              </label>
              <input
                type="text"
                placeholder="Ex: Corolla, Civic"
                {...register('model')}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              {errors.model && <p className="text-xs text-rose-400 mt-1">{errors.model.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Ano *
              </label>
              <input
                type="number"
                {...register('year', { valueAsNumber: true })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              />
              {errors.year && <p className="text-xs text-rose-400 mt-1">{errors.year.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Placa *
              </label>
              <input
                type="text"
                placeholder="ABC1D23"
                {...register('plate')}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 uppercase placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              {errors.plate && <p className="text-xs text-rose-400 mt-1">{errors.plate.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Tipo de Combustível *
            </label>
            <select
              {...register('fuelType')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            >
              {fuelTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.fuelType && <p className="text-xs text-rose-400 mt-1">{errors.fuelType.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Concessionária Responsável (Opcional)
            </label>
            <select
              {...register('dealerId', {
                setValueAs: (val) => (val === '' || val === null ? null : Number(val)),
              })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option value="">Nenhuma concessionária vinculada</option>
              {dealers.map((dealer) => (
                <option key={dealer.id} value={dealer.id}>
                  {dealer.name} (CNPJ: {dealer.cnpj})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors shadow-lg shadow-sky-600/30 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{vehicleToEdit ? 'Atualizar' : 'Salvar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
