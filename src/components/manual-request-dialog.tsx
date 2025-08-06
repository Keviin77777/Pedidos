
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
import { useState, useRef } from 'react';
import { FilePlus2, Upload, Image as ImageIcon } from 'lucide-react';
import { saveContentRequest } from '@/lib/admin';
import { useXtream } from '@/contexts/XtreamContext';

export function ManualRequestDialog() {
  const { toast } = useToast();
  const { userInfo } = useXtream();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'Arquivo muito grande',
          description: 'A imagem deve ter menos de 5MB.',
          variant: 'destructive',
        });
        return;
      }
      
      // Verificar se é um formato permitido
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Formato não suportado',
          description: 'Por favor, selecione apenas imagens JPG, JPEG ou PNG.',
          variant: 'destructive',
        });
        return;
      }
      
      setSelectedImage(file);
      setImageUrl(''); // Clear URL when file is selected
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (title.trim().length < 2) {
      toast({
        title: 'Título Inválido',
        description: 'O título deve ter pelo menos 2 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Determine which image to use (file or URL)
      let finalImageUrl = imageUrl;
      if (selectedImage && imagePreview) {
        finalImageUrl = imagePreview;
      }
      
      await saveContentRequest({
        title,
        notes,
        type: 'Pedido Manual',
        logo: finalImageUrl || null,
        username: userInfo?.username || 'Usuário desconhecido',
      });

      toast({
        title: 'Pedido Manual Enviado!',
        description: `Recebemos seu pedido para "${title}".`,
      });
      setIsOpen(false);
      setTitle('');
      setNotes('');
      setImageUrl('');
      setSelectedImage(null);
      setImagePreview('');
    } catch(error) {
       toast({
        title: 'Erro ao Enviar Pedido',
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Imagem
              </Label>
              <div className="col-span-3 space-y-3">
                {/* URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-sm text-muted-foreground">
                    URL da imagem (opcional)
                  </Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    disabled={isSubmitting}
                  />
                </div>
                
                {/* File Upload */}
                                 <div className="space-y-2">
                   <Label className="text-sm text-muted-foreground">
                     Ou faça upload de uma imagem (JPG, JPEG, PNG)
                   </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Escolher arquivo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    {selectedImage && (
                      <span className="text-sm text-muted-foreground">
                        {selectedImage.name}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Image Preview */}
                {(imagePreview || imageUrl) && (
                  <div className="mt-3">
                    <Label className="text-sm text-muted-foreground">Prévia:</Label>
                    <div className="mt-2 w-32 h-48 relative rounded-md overflow-hidden bg-muted">
                      <img
                        src={imagePreview || imageUrl}
                        alt="Prévia da imagem"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isSubmitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
