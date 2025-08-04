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

interface RequestDialogProps {
  initialValue?: string;
}

export function RequestDialog({ initialValue = '' }: RequestDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (title.trim().length < 2) {
      toast({
        title: 'Título Inválido',
        description: 'O título deve ter pelo menos 2 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    // In a real app, this would send the request to a server.
    console.log('Request submitted:', title);
    toast({
      title: 'Pedido Enviado!',
      description: `Recebemos seu pedido para "${title}".`,
    });
    setIsOpen(false);
    setTitle('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full">
          Fazer um pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Pedir Novo Conteúdo</DialogTitle>
            <DialogDescription>
              Não encontrou o que procurava? Faça um pedido e tentaremos adicionar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="Ex: The Matrix"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Enviar Pedido</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
