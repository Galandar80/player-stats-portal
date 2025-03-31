
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { dataService } from "@/lib/data-service";
import { ExternalLink, Trophy, CalendarIcon } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PlayerDetail = () => {
  const { playerName } = useParams<{ playerName: string }>();
  const [playerData, setPlayerData] = useState<ReturnType<typeof dataService.getPlayerByName>>();
  
  useEffect(() => {
    if (playerName) {
      const decodedName = decodeURIComponent(playerName);
      const data = dataService.getPlayerByName(decodedName);
      setPlayerData(data);
    }
  }, [playerName]);

  if (!playerData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto p-4 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Giocatore non trovato</CardTitle>
              <CardDescription>
                Il giocatore richiesto non è presente nei nostri registri
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link to="/">
                <Button>Torna alla home</Button>
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
          <Card className="md:col-span-1 card-hover">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  {player.photoUrl ? (
                    <AvatarImage src={player.photoUrl} alt={player.name} />
                  ) : (
                    <AvatarFallback className="text-3xl">
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <CardTitle className="text-center">{player.name}</CardTitle>
              <CardDescription className="text-center">
                {player.qualified && (
                  <Badge variant="outline" className="badge-qualified mt-2">
                    Qualificato One Piece
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Punti totali</div>
                <div className="text-2xl font-bold">{player.points}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Tornei partecipati</div>
                <div className="text-2xl font-bold">{tournaments.length}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Miglior piazzamento</div>
                <div className="text-2xl font-bold">
                  {Math.min(...tournaments.map(t => t.position))}° posto
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 card-hover">
            <CardHeader>
              <CardTitle>Storia Tornei</CardTitle>
              <CardDescription>
                Partecipazioni ai tornei e risultati
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Torneo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Posizione</TableHead>
                    <TableHead>Punti</TableHead>
                    <TableHead className="text-right">Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournaments.map((t, i) => (
                    <TableRow key={i} className="hover:bg-secondary/50 transition-colors">
                      <TableCell className="font-medium">{t.tournament.name}</TableCell>
                      <TableCell>
                        {new Date(t.tournament.created).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.position <= 3 ? "default" : "outline"}>
                          {t.position}° posto
                        </Badge>
                      </TableCell>
                      <TableCell>{t.points}</TableCell>
                      <TableCell className="text-right">
                        {t.tournament.challongeUrl && (
                          <a 
                            href={t.tournament.challongeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {topFourAppearances.length > 0 && (
            <Card className="md:col-span-3 card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Migliori risultati
                </CardTitle>
                <CardDescription>
                  Tornei in cui {player.name} è arrivato tra i primi 4
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topFourAppearances.map((t, i) => (
                    <div key={i} className="border rounded-lg overflow-hidden">
                      {t.tournament.players.find(p => p.name === player.name)?.photoUrl ? (
                        <div className="relative">
                          <AspectRatio ratio={16/9}>
                            <img 
                              src={t.tournament.players.find(p => p.name === player.name)?.photoUrl} 
                              alt={`${player.name} al torneo ${t.tournament.name}`}
                              className="object-cover w-full h-full"
                            />
                          </AspectRatio>
                          <div className="absolute top-2 right-2">
                            <Badge className="badge-tournament">
                              {t.position}° posto
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-secondary aspect-video flex items-center justify-center">
                          <Trophy className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="font-medium">{t.tournament.name}</h3>
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PlayerDetail;
