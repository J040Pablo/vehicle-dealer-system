import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dealerSchema, DealerFormData } from './DealerSchema';
import { Dealer } from '@/types/dealer';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DealerFormData) => Promise<void>;
  dealerToEdit?: Dealer | null;
  isLoading: boolean;
}

export const DealerFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  dealerToEdit,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DealerFormData>({
    resolver: zodResolver(dealerSchema),
  });

  useEffect(() => {
    if (dealerToEdit) {
      reset({
        name: dealerToEdit.name,
        cnpj: dealerToEdit.cnpj,
        cep: dealerToEdit.cep,
      });
    } else {
      reset({ name: '', cnpj: '', cep: '' });
    }
  }, [dealerToEdit, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            {dealerToEdit ? 'Editar Concessionária' : 'Nova Concessionária'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Razão Social / Nome *
            </label>
            <input
              type="text"
              placeholder="Ex: Concessionária Central Auto"
              {...register('name')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              CNPJ *
            </label>
            <input
              type="text"
              placeholder="00.000.000/0000-00"
              {...register('cnpj')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            {errors.cnpj && <p className="text-xs text-rose-400 mt-1">{errors.cnpj.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>CEP *</span>
              <span className="text-[10px] text-sky-400 flex items-center gap-1 normal-case">
                <Sparkles className="w-3 h-3" /> Endereço auto-preenchido pelo Backend via ViaCEP
              </span>
            </label>
            <input
              type="text"
              placeholder="58400-000"
              {...register('cep')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            {errors.cep && <p className="text-xs text-rose-400 mt-1">{errors.cep.message}</p>}
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
              <span>{dealerToEdit ? 'Atualizar' : 'Salvar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
