'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveContentRequest } from '@/lib/admin';
import type { M3UItem } from '@/lib/types';

interface SeriesUpdateDialogProps {
  item: M3UItem;
  children: React.ReactNode;
}

export function SeriesUpdateDialog({ item, children }: SeriesUpdateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [season, setSeason] = useState('');
  const [episode, setEpisode] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!season.trim()) {
      toast({
        title: 'Campo Obrigatório',
        description: 'Por favor, informe a temporada que deseja atualizar.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updateDetails = episode.trim() 
        ? `Temporada ${season}, Episódio ${episode}`
        : `Temporada ${season}`;
      
      const requestTitle = `${item.name} - Atualização: ${updateDetails}`;
      
             await saveContentRequest({
         title: requestTitle,
         type: 'Série',
         notes: notes.trim() ? `${updateDetails}. Observação: ${notes}` : updateDetails,
         logo: item.logo || '',
       });

      toast({
        title: 'Pedido de Atualização Enviado!',
        description: 'Sua solicitação foi registrada e será analisada pela nossa equipe.',
      });

      setIsOpen(false);
      setSeason('');
      setEpisode('');
      setNotes('');
    } catch (error) {
      console.error('Erro ao enviar pedido de atualização:', error);
      toast({
        title: 'Erro ao Enviar Pedido',
        description: 'Não foi possível enviar sua solicitação. Tente novamente.',
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
            <DialogTitle>Pedir Atualização de Série</DialogTitle>
            <DialogDescription>
              Solicite a adição de novas temporadas ou episódios para séries já disponíveis no sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Certifique-se de que a temporada/episódio já foi lançado oficialmente antes de fazer o pedido. 
                Não solicitamos conteúdo que ainda não foi disponibilizado pelos estúdios.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="season" className="text-left">
                  Temporada *
                </Label>
                <Input
                  id="season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  placeholder="Ex: 2"
                  className="col-span-1"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="episode" className="text-left">
                  Episódio (opcional)
                </Label>
                <Input
                  id="episode"
                  value={episode}
                  onChange={(e) => setEpisode(e.target.value)}
                  placeholder="Ex: 5"
                  className="col-span-1"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-left">
                Observação Adicional (opcional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
                placeholder="Ex: Dublagem em português, qualidade HD, etc."
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 