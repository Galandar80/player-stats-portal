
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { dataService, Tournament, Player } from "@/lib/data-service";
import { toast } from "sonner";

const Admin = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [newTournamentName, setNewTournamentName] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");

  useEffect(() => {
    // Redirect if not admin
    if (isAuthenticated && !isAdmin) {
      navigate("/");
      toast.error("Accesso non autorizzato");
    } else if (!isAuthenticated) {
      navigate("/login");
      toast.error("Effettua l'accesso per continuare");
    }

    // Load tournaments
    loadTournaments();
  }, [isAdmin, isAuthenticated, navigate]);

  const loadTournaments = () => {
    const tournamentsData = dataService.getTournaments();
    setTournaments(tournamentsData);
  };

  const createTournament = () => {
    if (!newTournamentName.trim()) {
      toast.error("Inserisci un nome per il torneo");
      return;
    }

    const tournament = dataService.createTournament(newTournamentName);
    setTournaments([...tournaments, tournament]);
    setNewTournamentName("");
    toast.success(`Torneo "${tournament.name}" creato con successo!`);
  };

  const deleteTournament = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo torneo?")) {
      dataService.deleteTournament(id);
      loadTournaments();
      
      if (selectedTournament?.id === id) {
        setSelectedTournament(null);
      }
      
      toast.success("Torneo eliminato con successo!");
    }
  };

  const openTournamentManagement = (tournament: Tournament) => {
    setSelectedTournament(tournament);
  };

  const closeTournamentManagement = () => {
    setSelectedTournament(null);
  };

  const addPlayer = () => {
    if (!selectedTournament) return;
    if (!newPlayerName.trim()) {
      toast.error("Inserisci il nome del giocatore");
      return;
    }

    dataService.addPlayer(selectedTournament.id, newPlayerName);
    
    // Reload tournament data
    const updatedTournament = dataService.getTournament(selectedTournament.id);
    if (updatedTournament) {
      setSelectedTournament(updatedTournament);
    }
    
    setNewPlayerName("");
    toast.success("Giocatore aggiunto con successo!");
  };

  const updatePlayer = (player: Player, updates: Partial<Player>) => {
    if (!selectedTournament) return;
    
    dataService.updatePlayer(selectedTournament.id, player.id, updates);
    
    // Reload tournament data
    const updatedTournament = dataService.getTournament(selectedTournament.id);
    if (updatedTournament) {
      setSelectedTournament(updatedTournament);
    }
    
    toast.success("Giocatore aggiornato con successo!");
  };

  const deletePlayer = (playerId: string) => {
    if (!selectedTournament) return;
    
    if (window.confirm("Sei sicuro di voler eliminare questo giocatore?")) {
      dataService.deletePlayer(selectedTournament.id, playerId);
      
      // Reload tournament data
      const updatedTournament = dataService.getTournament(selectedTournament.id);
      if (updatedTournament) {
        setSelectedTournament(updatedTournament);
      }
      
      toast.success("Giocatore eliminato con successo!");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <span className="text-muted-foreground">⚙️</span> Amministrazione Tornei
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sezione creazione nuovo torneo */}
          <Card>
            <CardHeader>
              <CardTitle>Nuovo Torneo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome del torneo"
                  value={newTournamentName}
                  onChange={(e) => setNewTournamentName(e.target.value)}
                />
                <Button onClick={createTournament}>
                  Crea
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sezione tornei esistenti */}
          <Card>
            <CardHeader>
              <CardTitle>Tornei Esistenti</CardTitle>
            </CardHeader>
            <CardContent>
              {tournaments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nessun torneo creato
                </p>
              ) : (
                <div className="space-y-2">
                  {tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="flex justify-between items-center p-3 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">{tournament.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Creato il {new Date(tournament.created).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => openTournamentManagement(tournament)}
                        >
                          Gestisci
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => deleteTournament(tournament.id)}
                        >
                          Elimina
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sezione gestione dettagliata torneo */}
        {selectedTournament && (
          <Card className="mt-6">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <CardTitle>
                Gestione Torneo: {selectedTournament.name}
              </CardTitle>
              <Button variant="outline" onClick={closeTournamentManagement}>
                Chiudi
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Input
                  placeholder="Nome giocatore"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="md:w-1/2"
                />
                <Button onClick={addPlayer}>
                  Aggiungi Giocatore
                </Button>
              </div>

              <h3 className="text-lg font-semibold mb-4">Elenco Giocatori</h3>
              
              {selectedTournament.players.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nessun giocatore in questo torneo
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedTournament.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex flex-col md:flex-row justify-between p-4 border rounded-md"
                    >
                      <div className="mb-3 md:mb-0">
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Punti: {player.points} - Posizione: {player.position}°
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Input
                            className="w-20"
                            type="number"
                            value={player.points}
                            onChange={(e) => updatePlayer(player, { points: parseInt(e.target.value) || 0 })}
                            aria-label="Punti"
                            placeholder="Punti"
                          />
                          <Input
                            className="w-20"
                            type="number"
                            value={player.position}
                            onChange={(e) => updatePlayer(player, { position: parseInt(e.target.value) || 0 })}
                            aria-label="Posizione"
                            placeholder="Pos"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`qualified-${player.id}`} 
                              checked={player.qualified}
                              onCheckedChange={(checked) => updatePlayer(player, { qualified: !!checked })}
                            />
                            <label
                              htmlFor={`qualified-${player.id}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              One Piece
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const updates = {
                                points: player.points,
                                position: player.position,
                                qualified: player.qualified
                              };
                              updatePlayer(player, updates);
                            }}
                          >
                            Salva
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deletePlayer(player.id)}
                          >
                            Elimina
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
