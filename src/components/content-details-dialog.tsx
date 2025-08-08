'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Star, Calendar, Users, Film, Tv } from 'lucide-react';
import type { M3UItem } from '@/lib/types';

interface ContentDetailsDialogProps {
  item: M3UItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentDetailsDialog({ item, open, onOpenChange }: ContentDetailsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [tmdbDetails, setTmdbDetails] = useState<any>(null);

  // Buscar detalhes do IPTV quando o modal abrir
  const fetchIptvDetails = async () => {
    if (!item) return;
    
    setLoading(true);
    try {
      const API_URL = process.env.XUI_API_URL || 'https://dnscine.top';
      const USERNAME = process.env.XUI_USERNAME || 'Vodsm3u789DS';
      const PASSWORD = process.env.XUI_PASSWORD || 'w5NwV8dPXE';
      
      const baseUrl = `${API_URL}/player_api.php?username=${USERNAME}&password=${PASSWORD}`;
      
      // Verificar se temos ID válido
      if (!item.vod_id && !item.series_id) {
        setLoading(false);
        return;
      }
      
      // Determinar o endpoint baseado no tipo
      const endpoint = item.type === 'series' 
        ? `${baseUrl}&action=get_series_info&series_id=${item.series_id}`
        : `${baseUrl}&action=get_vod_info&vod_id=${item.vod_id}`;
      
      const response = await fetch(endpoint, { cache: 'no-store' });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data) {
          // Extrair dados da estrutura aninhada do IPTV
          let iptvDetails = null;
          
          if (item.type === 'series') {
            // Para séries, usar a estrutura direta
            iptvDetails = data.info || data;
          } else {
            // Para filmes, extrair do campo 'info'
            iptvDetails = data.info || data;
          }
          
          // Se temos TMDB ID, buscar dados adicionais do TMDB
          if (iptvDetails?.tmdb_id) {
            try {
              const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '279e039eafd4ccc7c289a589c9b613e3';
              const tmdbResponse = await fetch(
                `https://api.themoviedb.org/3/movie/${iptvDetails.tmdb_id}?api_key=${TMDB_API_KEY}&language=pt-BR&append_to_response=credits`,
                { cache: 'no-store' }
              );
              
              if (tmdbResponse.ok) {
                const tmdbData = await tmdbResponse.json();
                // Combinar dados do IPTV com dados do TMDB
                setTmdbDetails({
                  ...iptvDetails,
                  tmdb_credits: tmdbData.credits,
                  tmdb_genres: tmdbData.genres
                });
              } else {
                setTmdbDetails(iptvDetails);
              }
            } catch (tmdbError) {
              setTmdbDetails(iptvDetails);
            }
          } else {
            setTmdbDetails(iptvDetails);
          }
        }
      }
    } catch (error) {
      // Silenciar erro para produção
    } finally {
      setLoading(false);
    }
  };

  // Buscar detalhes quando o modal abrir
  useEffect(() => {
    if (open && item) {
      // Limpar dados anteriores e buscar novos
      setTmdbDetails(null);
      // Pequeno delay para garantir que o modal esteja aberto
      setTimeout(() => {
        fetchIptvDetails();
      }, 100);
    }
  }, [open, item]);

  if (!item) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDirector = () => {
    if (!tmdbDetails?.director) return 'N/A';
    return tmdbDetails.director;
  };

  const getMainCast = () => {
    if (!tmdbDetails?.actors) return [];
    return tmdbDetails.actors.split(',').slice(0, 5).map((actor: string, index: number) => ({
      id: index,
      name: actor.trim(),
      character: ''
    }));
  };

  const getGenres = () => {
    if (!tmdbDetails?.genre) return [];
    return tmdbDetails.genre.split(',').map((genre: string) => genre.trim());
  };

  const getRating = () => {
    if (!tmdbDetails?.rating) return null;
    return tmdbDetails.rating;
  };

  const getDuration = () => {
    if (!tmdbDetails?.duration) return null;
    return tmdbDetails.duration;
  };

  const getReleaseDate = () => {
    if (!tmdbDetails?.release_date) return null;
    return tmdbDetails.release_date;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {item.type === 'series' ? <Tv className="h-6 w-6" /> : <Film className="h-6 w-6" />}
            {item.name}
          </DialogTitle>
          <DialogDescription>
            {item.category} • {item.type === 'series' ? 'Série' : 'Filme'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Imagem */}
          <div className="lg:col-span-1">
            <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
              <img
                src={item.logo || 'https://placehold.co/400x600.png'}
                alt={`Capa de ${item.name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/400x600.png';
                }}
              />
            </div>
          </div>

          {/* Informações */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="text-muted-foreground">Carregando detalhes...</span>
                </div>
              </div>
            )}

            {/* Conteúdo quando não está carregando */}
            {!loading && (
              <>
                {/* Informações básicas */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {getReleaseDate() && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(getReleaseDate()!)}
                      </div>
                    )}
                    {getRating() && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {getRating()}/10
                      </div>
                    )}
                    {getDuration() && (
                      <div className="flex items-center gap-1">
                        <Film className="h-4 w-4" />
                        {getDuration()}
                      </div>
                    )}
                  </div>

                  {/* Gêneros */}
                  {getGenres().length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {getGenres().map((genre: string) => (
                        <Badge key={genre} variant="secondary">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Sinopse */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Sinopse</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {tmdbDetails?.plot || tmdbDetails?.description || item.synopsis || 'Sinopse não disponível.'}
                  </p>
                </div>

                <Separator />

                {/* Diretor */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Direção</h3>
                  <p className="text-muted-foreground">
                    {getDirector()}
                  </p>
                </div>

                <Separator />

                {/* Elenco */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Elenco Principal
                  </h3>
                  {getMainCast().length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {getMainCast().map((actor: any) => (
                        <div key={actor.id} className="text-sm">
                          <span className="font-medium">{actor.name}</span>
                          {actor.character && (
                            <span className="text-muted-foreground block">como {actor.character}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Informações do elenco não disponíveis.</p>
                  )}
                </div>

                {/* Informações adicionais do IPTV */}
                {tmdbDetails && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Informações Adicionais</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {tmdbDetails.year && (
                          <div>
                            <span className="font-medium">Ano:</span>
                            <span className="text-muted-foreground ml-2">{tmdbDetails.year}</span>
                          </div>
                        )}
                        {tmdbDetails.country && (
                          <div>
                            <span className="font-medium">País:</span>
                            <span className="text-muted-foreground ml-2">{tmdbDetails.country}</span>
                          </div>
                        )}
                        {tmdbDetails.episode_run_time && (
                          <div>
                            <span className="font-medium">Duração (min):</span>
                            <span className="text-muted-foreground ml-2">{tmdbDetails.episode_run_time}</span>
                          </div>
                        )}
                        {tmdbDetails.bitrate && (
                          <div>
                            <span className="font-medium">Bitrate:</span>
                            <span className="text-muted-foreground ml-2">{tmdbDetails.bitrate} kbps</span>
                          </div>
                        )}
                        {tmdbDetails.container_extension && (
                          <div>
                            <span className="font-medium">Formato:</span>
                            <span className="text-muted-foreground ml-2">{tmdbDetails.container_extension.toUpperCase()}</span>
                          </div>
                        )}
                        {tmdbDetails.age && (
                          <div>
                            <span className="font-medium">Classificação:</span>
                            <span className="text-muted-foreground ml-2">{tmdbDetails.age}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Trailer do YouTube */}
                {tmdbDetails?.youtube_trailer && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Trailer</h3>
                      <div className="aspect-video w-full">
                        <iframe
                          src={`https://www.youtube.com/embed/${tmdbDetails.youtube_trailer}`}
                          title="Trailer"
                          className="w-full h-full rounded-lg"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 