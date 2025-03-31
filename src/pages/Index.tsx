
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { dataService, Tournament } from "@/lib/data-service";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [playerParticipations, setPlayerParticipations] = useState<Record<string, number[]>>({});
  const [qualifiedPlayers, setQualifiedPlayers] = useState<{ name: string, tournament: string }[]>([]);
  const [totalPoints, setTotalPoints] = useState<{ name: string, points: number }[]>([]);
  const [rewards, setRewards] = useState(dataService.getRewards());

  useEffect(() => {
    const tournaments = dataService.getTournaments();
    setTournaments(tournaments);
    
    if (tournaments.length > 0) {
      setSelectedTournamentId(tournaments[0].id);
    }
    
    setPlayerParticipations(dataService.getPlayerParticipations());
    setQualifiedPlayers(dataService.getQualifiedPlayers());
    
    const players = dataService.getAllPlayers();
    const pointsMap: Record<string, number> = {};
    
    players.forEach(player => {
      pointsMap[player.name] = (pointsMap[player.name] || 0) + player.points;
    });
    
    const pointsArray = Object.entries(pointsMap).map(([name, points]) => ({ name, points }));
    pointsArray.sort((a, b) => b.points - a.points);
    setTotalPoints(pointsArray);
  }, []);

  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 animate-fade-in">
          <span className="text-yellow-500">🏆</span> Lega dello Stretto - Classifiche
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Classifica Torneo */}
          <Card className="animate-fade-in card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Classifica Torneo</span>
                {selectedTournament?.challongeUrl && (
                  <a 
                    href={selectedTournament.challongeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Challonge</span>
                  </a>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedTournamentId} 
                onValueChange={setSelectedTournamentId}
              >
                <SelectTrigger className="mb-4">
                  <SelectValue placeholder="Seleziona un torneo" />
                </SelectTrigger>
                <SelectContent>
                  {tournaments.map(tournament => (
                    <SelectItem key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="overflow-x-auto">
                <table className="w-full tournament-table">
                  <thead>
                    <tr>
                      <th className="text-left p-3 rounded-tl-md">Posizione</th>
                      <th className="text-left p-3">Giocatore</th>
                      <th className="text-left p-3 rounded-tr-md">Punti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTournament && selectedTournament.players
                      .sort((a, b) => a.position - b.position)
                      .map(player => (
                        <tr key={player.id} className="border-b hover:bg-secondary/30 transition-colors">
                          <td className="p-3">{player.position}°</td>
                          <td className="p-3">
                            <Link 
                              to={`/player/${encodeURIComponent(player.name)}`}
                              className="hover:text-primary transition-colors"
                            >
                              {player.name}
                            </Link>
                          </td>
                          <td className="p-3">{player.points}</td>
                        </tr>
                      ))}
                    {(!selectedTournament || selectedTournament.players.length === 0) && (
                      <tr>
                        <td colSpan={3} className="p-3 text-center text-muted-foreground">
                          Nessun giocatore in questo torneo
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Qualificati One Piece */}
          <Card className="animate-fade-in card-hover" style={{animationDelay: "0.1s"}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🎌</span> Qualificati One Piece
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full qualifiers-table">
                  <thead>
                    <tr>
                      <th className="text-left p-3 rounded-tl-md">Giocatore</th>
                      <th className="text-left p-3 rounded-tr-md">Torneo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualifiedPlayers.map((player, idx) => (
                      <tr key={idx} className="border-b hover:bg-secondary/30 transition-colors">
                        <td className="p-3">
                          <Link 
                            to={`/player/${encodeURIComponent(player.name)}`}
                            className="hover:text-primary transition-colors"
                          >
                            {player.name}
                          </Link>
                        </td>
                        <td className="p-3">{player.tournament}</td>
                      </tr>
                    ))}
                    {qualifiedPlayers.length === 0 && (
                      <tr>
                        <td colSpan={2} className="p-3 text-center text-muted-foreground">
                          Nessun giocatore qualificato
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Storico Partecipazioni */}
          <Card className="animate-fade-in card-hover" style={{animationDelay: "0.2s"}}>
            <CardHeader>
              <CardTitle>Storico Partecipazioni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-3 rounded-tl-md bg-tournament text-white">Giocatore</th>
                      <th className="text-left p-3 rounded-tr-md bg-tournament text-white">Posizioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(playerParticipations).map(([name, positions]) => (
                      <tr key={name} className="border-b hover:bg-secondary/30 transition-colors">
                        <td className="p-3">
                          <Link 
                            to={`/player/${encodeURIComponent(name)}`}
                            className="hover:text-primary transition-colors"
                          >
                            {name}
                          </Link>
                        </td>
                        <td className="p-3 position-cell">
                          {positions.map((pos, idx) => (
                            <span key={idx}>
                              {pos > 0 ? pos : '-'}
                              {idx < positions.length - 1 ? ' - ' : ''}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Punti Totali */}
          <Card className="animate-fade-in md:col-span-1 card-hover" style={{animationDelay: "0.3s"}}>
            <CardHeader>
              <CardTitle>Punti Totali</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full points-table">
                  <thead>
                    <tr>
                      <th className="text-left p-3 rounded-tl-md">Giocatore</th>
                      <th className="text-left p-3 rounded-tr-md">Punti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totalPoints.map((entry, idx) => (
                      <tr key={idx} className="border-b hover:bg-secondary/30 transition-colors">
                        <td className="p-3">
                          <Link 
                            to={`/player/${encodeURIComponent(entry.name)}`}
                            className="hover:text-primary transition-colors"
                          >
                            {entry.name}
                          </Link>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="font-semibold">
                            {entry.points}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Prossimi Tornei */}
          <Card className="animate-fade-in md:col-span-1 card-hover" style={{animationDelay: "0.4s"}}>
            <CardHeader>
              <CardTitle>Prossimi Tornei</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tournaments.filter(t => t.registrationOpen).map(tournament => {
                  const registeredCount = tournament.registeredPlayers?.length || 0;
                  return (
                    <div key={tournament.id} className="border rounded-lg p-4 transition-all hover:shadow-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium mb-1">{tournament.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            {tournament.date 
                              ? new Date(tournament.date).toLocaleDateString() 
                              : 'Data da definire'}
                          </div>
                        </div>
                        <Badge className="bg-green-500 hover:bg-green-600">
                          Aperto
                        </Badge>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Iscritti:</span>{" "}
                          <span className="font-medium">
                            {registeredCount}
                            {tournament.maxPlayers ? `/${tournament.maxPlayers}` : ''}
                          </span>
                        </div>
                        <Link to="/profilo">
                          <Button size="sm">
                            Iscriviti
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
                
                {tournaments.filter(t => t.registrationOpen).length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Nessun torneo in programma</p>
                    <p className="text-sm mt-1">Torna più tardi per verificare nuovi tornei</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Premi */}
          <Card className="animate-fade-in md:col-span-1 card-hover" style={{animationDelay: "0.5s"}}>
            <CardHeader>
              <CardTitle>Premi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full rewards-table">
                  <thead>
                    <tr>
                      <th className="text-left p-3 rounded-tl-md">Soglia</th>
                      <th className="text-left p-3 rounded-tr-md">Premio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewards.map((reward, idx) => (
                      <tr key={idx} className="border-b hover:bg-secondary/30 transition-colors">
                        <td className="p-3">{reward.threshold} punti</td>
                        <td className="p-3">{reward.prize}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
