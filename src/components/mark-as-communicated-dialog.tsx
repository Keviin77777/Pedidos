'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { markRequestAsCommunicated } from '@/lib/admin';

interface MarkAsCommunicatedDialogProps {
  requestId: string;
  requestTitle: string;
  children: React.ReactNode;
}

export function MarkAsCommunicatedDialog({ requestId, requestTitle, children }: MarkAsCommunicatedDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: 'Campo Obrigatório',
        description: 'Por favor, informe a mensagem do comunicado.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await markRequestAsCommunicated(requestId, message.trim());
      
      toast({
        title: 'Comunicado Enviado!',
        description: 'O comunicado foi enviado com sucesso.',
      });

      setIsOpen(false);
      setMessage('');
    } catch (error) {
      console.error('Erro ao enviar comunicado:', error);
      toast({
        title: 'Erro ao Enviar Comunicado',
        description: 'Não foi possível enviar o comunicado. Tente novamente.',
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
            <DialogTitle>Enviar Comunicado</DialogTitle>
            <DialogDescription>
              Envie um comunicado para "{requestTitle}" informando sobre a disponibilidade.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message" className="text-left">
                Mensagem do Comunicado *
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
                placeholder="Ex: Infelizmente não há mais episódios disponíveis para esta série no momento. Tentaremos adicionar assim que novos episódios forem lançados."
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Comunicado'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 