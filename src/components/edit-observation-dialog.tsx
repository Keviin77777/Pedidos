'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateRequestObservation } from '@/lib/admin';

interface EditObservationDialogProps {
  requestId: string;
  requestTitle: string;
  currentObservation?: string;
  children: React.ReactNode;
}

export function EditObservationDialog({ requestId, requestTitle, currentObservation, children }: EditObservationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [observation, setObservation] = useState(currentObservation || '');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      await updateRequestObservation(requestId, observation.trim());
      
      toast({
        title: 'Observação Atualizada!',
        description: 'A observação foi atualizada com sucesso.',
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar observação:', error);
      toast({
        title: 'Erro ao Atualizar',
        description: 'Não foi possível atualizar a observação. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Observação</DialogTitle>
            <DialogDescription>
              Edite a observação para "{requestTitle}".
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="observation" className="text-left">
                Observação
              </Label>
              <Textarea
                id="observation"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="min-h-[120px]"
                placeholder="Digite a nova observação..."
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Observação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 