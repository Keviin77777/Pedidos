
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
import { Wrench } from 'lucide-react';
import type { M3UItem } from '@/lib/types';
import { saveProblemReport } from '@/lib/admin';

interface CorrectionDialogProps {
  item: M3UItem;
}

export function CorrectionDialog({ item }: CorrectionDialogProps) {
  const { toast } = useToast();
  const [issue, setIssue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (issue.trim().length < 10) {
      toast({
        title: 'Descrição Inválida',
        description: 'Por favor, descreva o problema com pelo menos 10 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    
    saveProblemReport({
        title: item.name,
        problem: issue,
    });

    toast({
      title: 'Relatório de Correção Enviado!',
      description: `Recebemos seu relatório para "${item.name}". Obrigado por ajudar!`,
    });
    setIsOpen(false);
    setIssue('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Wrench className="mr-2 h-4 w-4" />
          Corrigir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Relatar Problema</DialogTitle>
            <DialogDescription>
              Descreva o problema que você encontrou com "{item.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-start gap-2">
              <Label htmlFor="issue" className="text-left">
                Qual o problema?
              </Label>
              <Textarea
                id="issue"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="col-span-3 min-h-[120px]"
                placeholder="Ex: Áudio dessincronizado, imagem de baixa qualidade, episódio errado, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Enviar Relatório</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
