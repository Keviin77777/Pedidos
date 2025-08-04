
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { saveContentRequest } from '@/lib/admin';
import type { M3UItem } from '@/lib/types';

interface RequestWithNotesDialogProps {
  item: M3UItem;
  children: React.ReactNode;
}

export function RequestWithNotesDialog({ item, children }: RequestWithNotesDialogProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveContentRequest({
        title: item.name,
        type: item.category,
        logo: item.logo,
        notes: notes,
      });

      toast({
        title: 'Pedido Enviado!',
        description: `Recebemos seu pedido para "${item.name}".`,
      });
      setIsOpen(false);
      setNotes('');
    } catch (error) {
       toast({
        title: 'Erro ao Enviar',
        description: 'Não foi possível enviar seu pedido. Tente novamente.',
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
            <DialogTitle>Solicitar "{item.name}"</DialogTitle>
            <DialogDescription>
              Adicione uma observação ao seu pedido, se necessário.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-start gap-2">
              <Label htmlFor="notes" className="text-left">
                Observação (opcional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3 min-h-[120px]"
                placeholder="Ex: Áudio em inglês com legenda, versão 4K, etc."
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isSubmitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Confirmar Pedido'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
