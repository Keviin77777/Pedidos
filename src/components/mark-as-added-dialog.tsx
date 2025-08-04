
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
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { markRequestAsAdded } from '@/lib/admin';

interface MarkAsAddedDialogProps {
  requestId: string;
  requestTitle: string;
  children: React.ReactNode;
}

export function MarkAsAddedDialog({ requestId, requestTitle, children }: MarkAsAddedDialogProps) {
  const { toast } = useToast();
  const [category, setCategory] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (category.trim().length < 2) {
      toast({
        title: 'Categoria Inválida',
        description: 'A categoria deve ter pelo menos 2 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await markRequestAsAdded(requestId, category);
      toast({
        title: 'Pedido Marcado como Adicionado!',
        description: `O pedido para "${requestTitle}" foi atualizado.`,
      });
      setIsOpen(false);
      setCategory('');
    } catch (error) {
       toast({
        title: 'Erro ao Atualizar Pedido',
        description: 'Não foi possível atualizar o pedido. Tente novamente.',
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
            <DialogTitle>Marcar como Adicionado</DialogTitle>
            <DialogDescription>
              Informe a categoria onde "{requestTitle}" foi adicionado. Essa informação será exibida ao usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoria
              </Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="col-span-3"
                placeholder="Ex: Filmes: Lançamentos"
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
              {isSubmitting ? 'Salvando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
