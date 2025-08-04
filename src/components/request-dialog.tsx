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
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { FilePlus2 } from 'lucide-react';

export function ManualRequestDialog() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
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
    console.log('Manual Request submitted:', { title, notes });
    toast({
      title: 'Pedido Manual Enviado!',
      description: `Recebemos seu pedido para "${title}".`,
    });
    setIsOpen(false);
    setTitle('');
    setNotes('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-sm text-muted-foreground">
          <FilePlus2 className="mr-2 h-4 w-4" />
          Não encontrou? Peça manualmente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Pedir Conteúdo Manualmente</DialogTitle>
            <DialogDescription>
              Use este formulário se não encontrou o que procurava na busca.
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
                placeholder="Ex: O Poderoso Chefão (1972)"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Observação
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="Alguma informação adicional? Ex: Versão do diretor, dublagem específica, etc."
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
