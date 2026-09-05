import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealerService } from '@/services/dealerService';
import { Dealer } from '@/types/dealer';
import { DealerFormModal } from './DealerFormModal';
import { DealerFormData } from './DealerSchema';
import { Building2, Plus, MapPin, Trash2, Edit3, Loader2, AlertCircle } from 'lucide-react';

export const DealerList: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: dealers = [], isLoading, isError, error } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealerService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: dealerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      setIsModalOpen(false);
      setErrorMessage(null);
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DealerFormData }) => dealerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      setIsModalOpen(false);
      setSelectedDealer(null);
      setErrorMessage(null);
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: dealerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
    },
  });

  const handleOpenCreate = () => {
    setSelectedDealer(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dealer: Dealer) => {
    setSelectedDealer(dealer);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: DealerFormData) => {
    if (selectedDealer) {
      await updateMutation.mutateAsync({ id: selectedDealer.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta concessionária? Os veículos associados serão desvinculados.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-sky-500" /> Concessionárias Parceiras
          </h1>
          <p className="text-sm text-slate-400">
            Gerencie as concessionárias cadastradas e acompanhe o auto-preenchimento de endereços via ViaCEP.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-sky-600/30"
        >
          <Plus className="w-4 h-4" /> Nova Concessionária
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
          <span>Carregando concessionárias...</span>
        </div>
      ) : isError ? (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400">
          Ocorreu um erro ao carregar as concessionárias: {(error as Error).message}
        </div>
      ) : dealers.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl space-y-3">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">Nenhuma concessionária cadastrada</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Clique no botão acima para adicionar a primeira concessionária. O endereço será preenchido automaticamente ao informar o CEP.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dealers.map((dealer) => (
            <div
              key={dealer.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-white text-lg group-hover:text-sky-400 transition-colors">
                    {dealer.name}
                  </h3>
                  <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full font-mono font-medium">
                    CNPJ: {dealer.cnpj}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <div className="flex items-center gap-1.5 font-medium text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{dealer.street}, {dealer.neighborhood}</span>
                  </div>
                  <div className="pl-5 text-slate-400">
                    {dealer.city} - {dealer.state} | <span className="font-mono">{dealer.cep}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>{dealer.totalVehicles ?? 0} Veículo(s) vinculados</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(dealer)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-sky-400 rounded-md transition-colors"
                    title="Editar Concessionária"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dealer.id)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
                    title="Excluir Concessionária"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DealerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        dealerToEdit={selectedDealer}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
