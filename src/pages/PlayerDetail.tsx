
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { dataService } from "@/lib/data-service";
import { ExternalLink, Trophy, CalendarIcon, Anchor, MapPin } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DeckImage {
  tournamentId: string;
  imageUrl: string;
}

const PlayerDetail = () => {
  const { playerName } = useParams<{ playerName: string }>();
  const [playerData, setPlayerData] = useState<ReturnType<typeof dataService.getPlayerByName>>();
  const [deckImages, setDeckImages] = useState<DeckImage[]>([]);
  
  useEffect(() => {
    if (playerName) {
      const decodedName = decodeURIComponent(playerName);
      const data = dataService.getPlayerByName(decodedName);
      
      // Simulated deck images - in a real app, this would come from the data service
      // This is just a placeholder for demonstration
      const mockDeckImages: DeckImage[] = data?.tournaments
        .filter(t => t.position <= 4)
        .map(t => ({
          tournamentId: t.tournament.id,
          imageUrl: "/placeholder.svg" // In a real app, this would be a real image URL
        })) || [];
      
      setPlayerData(data);
      setDeckImages(mockDeckImages);
    }
  }, [playerName]);

  if (!playerData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto p-4 flex items-center justify-center">
          <Card className="w-full max-w-md pirate-card">
            <CardHeader className="text-center">
              <CardTitle className="pirate-header">Giocatore non trovato</CardTitle>
              <CardDescription>
                Il giocatore richiesto non è presente nei nostri registri
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link to="/">
                <Button className="bg-amber-700 hover:bg-amber-800 text-amber-50">Torna alla home</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const { player, tournaments } = playerData;
  const topFourAppearances = tournaments.filter(t => t.position <= 4);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 pirate-card animate-fade-in">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Avatar className="h-32 w-32 pirate-avatar">
                  {player.photoUrl ? (
                    <AvatarImage src={player.photoUrl} alt={player.name} />
                  ) : (
                    <AvatarFallback className="text-4xl bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <CardTitle className="text-center pirate-header text-amber-900 dark:text-amber-500">{player.name}</CardTitle>
              <CardDescription className="text-center">
                {player.qualified && (
                  <Badge variant="outline" className="badge-qualified mt-2 bg-amber-600/20 text-amber-600 dark:bg-amber-400/20 dark:text-amber-400 border-amber-600/30 dark:border-amber-400/30">
                    <Anchor className="h-3.5 w-3.5 mr-1" /> Qualificato One Piece
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="treasure-box flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-amber-700 dark:text-amber-500">{player.points}</div>
                  <div className="text-xs text-muted-foreground text-center">Punti totali</div>
                </div>
                <div className="treasure-box flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-amber-700 dark:text-amber-500">{tournaments.length}</div>
                  <div className="text-xs text-muted-foreground text-center">Tornei</div>
                </div>
                <div className="treasure-box flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-amber-700 dark:text-amber-500">
                    {Math.min(...tournaments.map(t => t.position))}°
                  </div>
                  <div className="text-xs text-muted-foreground text-center">Miglior posizione</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 pirate-card animate-fade-in" style={{animationDelay: "0.1s"}}>
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-700 dark:text-amber-500" />
                Storia Tornei
              </CardTitle>
              <CardDescription>
                Partecipazioni ai tornei e risultati
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full pirate-table">
                  <thead>
                    <tr>
                      <th>Torneo</th>
                      <th>Data</th>
                      <th>Posizione</th>
                      <th>Punti</th>
                      <th className="text-right">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map((t, i) => (
                      <tr key={i} className="hover:bg-secondary/50 transition-colors">
                        <td className="font-medium">{t.tournament.name}</td>
                        <td>
                          {new Date(t.tournament.created).toLocaleDateString()}
                        </td>
                        <td>
                          <Badge variant={t.position <= 3 ? "default" : "outline"} 
                            className={t.position <= 3 ? 
                              "bg-amber-600/90 hover:bg-amber-700/90 text-white" : 
                              "bg-transparent border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"}>
                            {t.position}° posto
                          </Badge>
                        </td>
                        <td>{t.points}</td>
                        <td className="text-right">
                          {t.tournament.challongeUrl && (
                            <a 
                              href={t.tournament.challongeUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="sm" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/30">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {topFourAppearances.length > 0 && (
            <Card className="md:col-span-3 pirate-card animate-fade-in" style={{animationDelay: "0.2s"}}>
              <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
                <CardTitle className="pirate-header flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Migliori risultati
                </CardTitle>
                <CardDescription>
                  Tornei in cui {player.name} è arrivato tra i primi 4
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topFourAppearances.map((t, i) => (
                    <div key={i} className="treasure-box overflow-hidden">
                      {t.tournament.players.find(p => p.name === player.name)?.photoUrl ? (
                        <div className="relative">
                          <AspectRatio ratio={16/9}>
                            <img 
                              src={t.tournament.players.find(p => p.name === player.name)?.photoUrl} 
                              alt={`${player.name} al torneo ${t.tournament.name}`}
                              className="object-cover w-full h-full rounded-md"
                            />
                          </AspectRatio>
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-amber-600/90 hover:bg-amber-700/90 text-white">
                              {t.position}° posto
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-100/50 dark:bg-amber-900/30 aspect-video flex items-center justify-center rounded-md">
                          <Trophy className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="font-medium text-amber-900 dark:text-amber-400">{t.tournament.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{new Date(t.tournament.created).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Deck list section */}
          <Card className="md:col-span-3 pirate-card animate-fade-in" style={{animationDelay: "0.3s"}}>
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-700 dark:text-amber-500" />
                Deck Lists
              </CardTitle>
              <CardDescription>
                Le deck list usate da {player.name} nei tornei
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {deckImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {deckImages.map((deck, i) => {
                    const tournamentInfo = tournaments.find(t => t.tournament.id === deck.tournamentId)?.tournament;
                    return (
                      <div key={i} className="treasure-box overflow-hidden">
                        <div className="mb-2">
                          <h3 className="font-medium text-amber-900 dark:text-amber-400">
                            {tournamentInfo?.name || "Torneo"}
                          </h3>
                          <div className="text-sm text-muted-foreground">
                            {tournamentInfo ? new Date(tournamentInfo.created).toLocaleDateString() : ""}
                          </div>
                        </div>
                        <AspectRatio ratio={3/4} className="overflow-hidden rounded-md border border-amber-200/50 dark:border-amber-800/50">
                          <img 
                            src={deck.imageUrl} 
                            alt={`Deck list di ${player.name} per ${tournamentInfo?.name || "un torneo"}`}
                            className="object-cover w-full h-full"
                          />
                        </AspectRatio>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground map-bg rounded-lg">
                  <p>Nessuna deck list disponibile</p>
                  <p className="text-sm mt-1">Il giocatore non ha ancora caricato alcuna deck list</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PlayerDetail;
