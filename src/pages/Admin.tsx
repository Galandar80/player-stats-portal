
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
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Upload, X } from "lucide-react";

const Admin = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [newTournamentName, setNewTournamentName] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [challongeUrl, setChallongeUrl] = useState("");

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
    
    // Update challongeUrl if provided
    if (challongeUrl) {
      dataService.updateTournament(tournament.id, { challongeUrl });
    }
    
    setTournaments([...tournaments, tournament]);
    setNewTournamentName("");
    setChallongeUrl("");
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
  
  const uploadPlayerPhoto = (playerId: string) => {
    // In a real implementation, this would trigger a file upload dialog
    // For now, we'll simulate it by setting a mock URL
    const mockPhotoUrl = "/placeholder.svg"; // In a real app, this would be an uploaded image
    
    if (!selectedTournament) return;
    dataService.updatePlayer(selectedTournament.id, playerId, { photoUrl: mockPhotoUrl });
    
    // Reload tournament data
    const updatedTournament = dataService.getTournament(selectedTournament.id);
    if (updatedTournament) {
      setSelectedTournament(updatedTournament);
    }
    
    toast.success("Foto profilo aggiornata con successo!");
  };
  
  const uploadDeckList = (playerId: string) => {
    // In a real implementation, this would trigger a file upload dialog
    // For now, we'll simulate it
    toast.success("Deck list caricata con successo!");
    
    // In a real app, you would update the player's deck list in the database
  };
  
  const deletePlayerPhoto = (playerId: string) => {
    if (!selectedTournament) return;
    
    if (window.confirm("Sei sicuro di voler rimuovere la foto profilo?")) {
      dataService.updatePlayer(selectedTournament.id, playerId, { photoUrl: undefined });
      
      // Reload tournament data
      const updatedTournament = dataService.getTournament(selectedTournament.id);
      if (updatedTournament) {
        setSelectedTournament(updatedTournament);
      }
      
      toast.success("Foto profilo rimossa con successo!");
    }
  };
  
  const deleteDeckList = (playerId: string) => {
    // In a real implementation, this would delete the deck list from storage
    toast.success("Deck list eliminata con successo!");
    
    // In a real app, you would remove the player's deck list reference from the database
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-pirate mb-6 text-amber-900 dark:text-amber-500 flex items-center gap-2">
          <Trophy className="h-7 w-7 text-amber-700 dark:text-amber-500" /> 
          Amministrazione Tornei
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sezione creazione nuovo torneo */}
          <Card className="pirate-card">
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header">Nuovo Torneo</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Nome del torneo"
                  value={newTournamentName}
                  onChange={(e) => setNewTournamentName(e.target.value)}
                  className="bg-amber-50/80 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800"
                />
                <Input
                  placeholder="URL Challonge (opzionale)"
                  value={challongeUrl}
                  onChange={(e) => setChallongeUrl(e.target.value)}
                  className="bg-amber-50/80 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800"
                />
              </div>
              <Button 
                onClick={createTournament}
                className="bg-amber-700 hover:bg-amber-800 text-amber-50 w-full"
              >
                Crea Torneo
              </Button>
            </CardContent>
          </Card>

          {/* Sezione tornei esistenti */}
          <Card className="pirate-card">
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header">Tornei Esistenti</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {tournaments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nessun torneo creato
                </p>
              ) : (
                <div className="space-y-3">
                  {tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="flex justify-between items-center p-3 border border-amber-200 dark:border-amber-800 rounded-md bg-amber-50/50 dark:bg-amber-900/20"
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
                          className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
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
          <Card className="mt-6 pirate-card">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header">
                Gestione Torneo: {selectedTournament.name}
              </CardTitle>
              <Button 
                variant="outline" 
                onClick={closeTournamentManagement}
                className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
              >
                Chiudi
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Input
                  placeholder="Nome giocatore"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="md:w-1/2 bg-amber-50/80 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800"
                />
                <Button 
                  onClick={addPlayer}
                  className="bg-amber-700 hover:bg-amber-800 text-amber-50"
                >
                  Aggiungi Giocatore
                </Button>
              </div>

              <h3 className="text-lg font-medium text-amber-900 dark:text-amber-500 mb-4">Elenco Giocatori</h3>
              
              {selectedTournament.players.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-lg">
                  Nessun giocatore in questo torneo
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedTournament.players.map((player) => (
                    <div
                      key={player.id}
                      className="border border-amber-200 dark:border-amber-800 rounded-md bg-amber-50/50 dark:bg-amber-900/20 overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row p-3">
                        <div className="flex-grow mb-3 md:mb-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-10 w-10 pirate-avatar">
                              {player.photoUrl ? (
                                <AvatarImage src={player.photoUrl} alt={player.name} />
                              ) : (
                                <AvatarFallback className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                                  {player.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Punti: {player.points} - Posizione: {player.position}°
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => uploadPlayerPhoto(player.id)}
                              className="text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
                            >
                              <Upload className="h-3 w-3 mr-1" /> Foto profilo
                            </Button>
                            
                            {player.photoUrl && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deletePlayerPhoto(player.id)}
                                className="text-xs border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 bg-red-100/50 dark:bg-red-900/30 hover:bg-red-200/50 dark:hover:bg-red-800/30"
                              >
                                <X className="h-3 w-3 mr-1" /> Rimuovi foto
                              </Button>
                            )}
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => uploadDeckList(player.id)}
                              className="text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
                            >
                              <Upload className="h-3 w-3 mr-1" /> Deck list
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteDeckList(player.id)}
                              className="text-xs border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 bg-red-100/50 dark:bg-red-900/30 hover:bg-red-200/50 dark:hover:bg-red-800/30"
                            >
                              <X className="h-3 w-3 mr-1" /> Rimuovi deck
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">Punti</label>
                              <Input
                                className="h-8 w-20 bg-amber-50/80 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800"
                                type="number"
                                value={player.points}
                                onChange={(e) => updatePlayer(player, { points: parseInt(e.target.value) || 0 })}
                                aria-label="Punti"
                                placeholder="Punti"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">Posizione</label>
                              <Input
                                className="h-8 w-20 bg-amber-50/80 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800"
                                type="number"
                                value={player.position}
                                onChange={(e) => updatePlayer(player, { position: parseInt(e.target.value) || 0 })}
                                aria-label="Posizione"
                                placeholder="Pos"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={`qualified-${player.id}`} 
                                checked={player.qualified}
                                onCheckedChange={(checked) => updatePlayer(player, { qualified: !!checked })}
                                className="border-amber-400 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                              />
                              <label
                                htmlFor={`qualified-${player.id}`}
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                One Piece
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2 p-3 border-t border-amber-200 dark:border-amber-800 bg-amber-100/50 dark:bg-amber-900/30">
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
                          className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
                        >
                          Salva modifiche
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deletePlayer(player.id)}
                        >
                          Elimina giocatore
                        </Button>
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
