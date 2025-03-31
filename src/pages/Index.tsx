
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { dataService, Tournament } from "@/lib/data-service";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Compass, ExternalLink, MapPin, Ship, Anchor, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlayerCard } from "@/components/player-card";

const Index = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [playerParticipations, setPlayerParticipations] = useState<Record<string, number[]>>({});
  const [qualifiedPlayers, setQualifiedPlayers] = useState<{ name: string, tournament: string, photoUrl?: string }[]>([]);
  const [totalPoints, setTotalPoints] = useState<{ name: string, points: number, photoUrl?: string }[]>([]);
  const [rewards, setRewards] = useState(dataService.getRewards());

  useEffect(() => {
    const tournaments = dataService.getTournaments();
    setTournaments(tournaments);
    
    if (tournaments.length > 0) {
      setSelectedTournamentId(tournaments[0].id);
    }
    
    const participations = dataService.getPlayerParticipations();
    setPlayerParticipations(participations);
    
    const qualified = dataService.getQualifiedPlayers();
    setQualifiedPlayers(qualified);
    
    const players = dataService.getAllPlayers();
    const pointsMap: Record<string, {points: number, photoUrl?: string}> = {};
    
    players.forEach(player => {
      if (!pointsMap[player.name]) {
        pointsMap[player.name] = {
          points: player.points, 
          photoUrl: player.photoUrl
        };
      } else {
        pointsMap[player.name].points += player.points;
      }
    });
    
    const pointsArray = Object.entries(pointsMap).map(([name, data]) => ({ 
      name, 
      points: data.points,
      photoUrl: data.photoUrl
    }));
    
    pointsArray.sort((a, b) => b.points - a.points);
    setTotalPoints(pointsArray);
  }, []);

  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto p-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="compass-animation">
            <Compass className="h-8 w-8 text-amber-700 dark:text-amber-500" />
          </div>
          <h1 className="text-4xl font-pirate text-amber-900 dark:text-amber-500">
            Lega dello Stretto
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Classifica Torneo */}
          <Card className="animate-fade-in pirate-card">
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="flex items-center justify-between">
                <span className="pirate-header flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-700 dark:text-amber-500" />
                  Classifica Torneo
                </span>
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
            <CardContent className="pt-4">
              <Select 
                value={selectedTournamentId} 
                onValueChange={setSelectedTournamentId}
              >
                <SelectTrigger className="mb-4 bg-amber-50/80 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800">
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
                <table className="w-full pirate-table">
                  <thead>
                    <tr>
                      <th className="w-20">Posizione</th>
                      <th>Giocatore</th>
                      <th className="w-24">Punti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTournament && selectedTournament.players
                      .sort((a, b) => a.position - b.position)
                      .map(player => (
                        <tr key={player.id}>
                          <td>{player.position}°</td>
                          <td>
                            <PlayerCard 
                              name={player.name} 
                              photoUrl={player.photoUrl}
                              isQualified={player.qualified}
                              size="sm"
                            />
                          </td>
                          <td>{player.points}</td>
                        </tr>
                      ))}
                    {(!selectedTournament || selectedTournament.players.length === 0) && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted-foreground">
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
          <Card className="animate-fade-in pirate-card" style={{animationDelay: "0.1s"}}>
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header flex items-center gap-2">
                <Anchor className="h-5 w-5 text-qualifiers" />
                Qualificati One Piece
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full pirate-table qualifiers-table">
                  <thead>
                    <tr>
                      <th>Giocatore</th>
                      <th>Torneo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualifiedPlayers.map((player, idx) => (
                      <tr key={idx}>
                        <td>
                          <PlayerCard 
                            name={player.name} 
                            photoUrl={player.photoUrl}
                            isQualified={true}
                            size="sm"
                          />
                        </td>
                        <td>{player.tournament}</td>
                      </tr>
                    ))}
                    {qualifiedPlayers.length === 0 && (
                      <tr>
                        <td colSpan={2} className="text-center text-muted-foreground">
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
          <Card className="animate-fade-in pirate-card" style={{animationDelay: "0.2s"}}>
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-700 dark:text-amber-500" />
                Storico Partecipazioni
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full pirate-table">
                  <thead>
                    <tr>
                      <th>Giocatore</th>
                      <th>Posizioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(playerParticipations).map(([name, positions]) => {
                      const playerInfo = totalPoints.find(p => p.name === name);
                      return (
                        <tr key={name}>
                          <td>
                            <PlayerCard 
                              name={name} 
                              photoUrl={playerInfo?.photoUrl}
                              size="sm"
                              isQualified={qualifiedPlayers.some(qp => qp.name === name)}
                            />
                          </td>
                          <td className="position-cell">
                            {positions.map((pos, idx) => (
                              <span key={idx}>
                                {pos > 0 ? pos : '-'}
                                {idx < positions.length - 1 ? ' - ' : ''}
                              </span>
                            ))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Punti Totali */}
          <Card className="animate-fade-in md:col-span-1 pirate-card" style={{animationDelay: "0.3s"}}>
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header flex items-center gap-2">
                <Ship className="h-5 w-5 text-amber-700 dark:text-amber-500" />
                Punti Totali
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full pirate-table points-table">
                  <thead>
                    <tr>
                      <th>Giocatore</th>
                      <th>Punti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totalPoints.map((entry, idx) => (
                      <tr key={idx}>
                        <td>
                          <PlayerCard 
                            name={entry.name} 
                            photoUrl={entry.photoUrl}
                            size="sm"
                            isQualified={qualifiedPlayers.some(qp => qp.name === entry.name)}
                          />
                        </td>
                        <td>
                          <Badge variant="outline" className="font-semibold bg-amber-100/50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300">
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
          <Card className="animate-fade-in md:col-span-1 pirate-card" style={{animationDelay: "0.4s"}}>
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header flex items-center gap-2">
                <Compass className="h-5 w-5 text-amber-700 dark:text-amber-500" />
                Prossimi Tornei
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {tournaments.filter(t => t.registrationOpen).map(tournament => {
                  const registeredCount = tournament.registeredPlayers?.length || 0;
                  return (
                    <div key={tournament.id} className="treasure-box animate-sail">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-amber-900 dark:text-amber-400 mb-1">{tournament.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            {tournament.date 
                              ? new Date(tournament.date).toLocaleDateString() 
                              : 'Data da definire'}
                          </div>
                        </div>
                        <Badge className="bg-green-500/90 hover:bg-green-600/90 text-white">
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
                          <Button size="sm" className="bg-amber-700 hover:bg-amber-800 text-amber-50">
                            Iscriviti
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
                
                {tournaments.filter(t => t.registrationOpen).length === 0 && (
                  <div className="text-center py-6 text-muted-foreground map-bg rounded-lg p-4">
                    <p>Nessun torneo in programma</p>
                    <p className="text-sm mt-1">Torna più tardi per verificare nuovi tornei</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Premi */}
          <Card className="animate-fade-in md:col-span-1 pirate-card" style={{animationDelay: "0.5s"}}>
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Premi
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full pirate-table rewards-table">
                  <thead>
                    <tr>
                      <th>Soglia</th>
                      <th>Premio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewards.map((reward, idx) => (
                      <tr key={idx}>
                        <td>{reward.threshold} punti</td>
                        <td>{reward.prize}</td>
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
