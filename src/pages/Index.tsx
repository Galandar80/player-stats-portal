
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dataService, Tournament } from "@/lib/data-service";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

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
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Classifica Torneo</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedTournamentId} 
                onValueChange={setSelectedTournamentId}
              >
                <SelectTrigger>
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
              
              <div className="mt-4 overflow-x-auto">
                <table className="w-full tournament-table">
                  <thead>
                    <tr>
                      <th className="text-left p-3">Posizione</th>
                      <th className="text-left p-3">Giocatore</th>
                      <th className="text-left p-3">Punti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTournament && selectedTournament.players
                      .sort((a, b) => a.position - b.position)
                      .map(player => (
                        <tr key={player.id} className="border-b">
                          <td className="p-3">{player.position}°</td>
                          <td className="p-3">{player.name}</td>
                          <td className="p-3">{player.points}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Qualificati One Piece */}
          <Card className="animate-fade-in" style={{animationDelay: "0.1s"}}>
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
                      <th className="text-left p-3">Giocatore</th>
                      <th className="text-left p-3">Torneo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualifiedPlayers.map((player, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-3">{player.name}</td>
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
          <Card className="animate-fade-in" style={{animationDelay: "0.2s"}}>
            <CardHeader>
              <CardTitle>Storico Partecipazioni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-3 bg-tournament text-white">Giocatore</th>
                      <th className="text-left p-3 bg-tournament text-white">Posizioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(playerParticipations).map(([name, positions]) => (
                      <tr key={name} className="border-b">
                        <td className="p-3">{name}</td>
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
          <Card className="animate-fade-in md:col-span-1" style={{animationDelay: "0.3s"}}>
            <CardHeader>
              <CardTitle>Punti Totali</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full points-table">
                  <thead>
                    <tr>
                      <th className="text-left p-3">Giocatore</th>
                      <th className="text-left p-3">Punti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totalPoints.map((entry, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-3">{entry.name}</td>
                        <td className="p-3">{entry.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Premi */}
          <Card className="animate-fade-in md:col-span-1" style={{animationDelay: "0.4s"}}>
            <CardHeader>
              <CardTitle>Premi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full rewards-table">
                  <thead>
                    <tr>
                      <th className="text-left p-3">Soglia</th>
                      <th className="text-left p-3">Premio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewards.map((reward, idx) => (
                      <tr key={idx} className="border-b">
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
