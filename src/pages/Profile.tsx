
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { dataService, Tournament } from "@/lib/data-service";
import { CalendarIcon, TrophyIcon, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [registeredTournaments, setRegisteredTournaments] = useState<Tournament[]>([]);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate("/login");
    }

    // Load tournaments
    if (isAuthenticated && user) {
      const tournamentsData = dataService.getTournaments();
      setTournaments(tournamentsData);
      
      const upcoming = dataService.getUpcomingTournaments();
      setUpcomingTournaments(upcoming);
      
      const registered = dataService.getRegisteredTournaments(user.id);
      setRegisteredTournaments(registered);
    }
  }, [isAuthenticated, navigate, user]);
  
  const handleRegistration = (tournamentId: string) => {
    if (!user) return;
    
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    const isRegistered = dataService.isPlayerRegisteredForTournament(tournamentId, user.id);
    
    if (isRegistered) {
      const success = dataService.unregisterPlayerFromTournament(tournamentId, user.id);
      if (success) {
        toast.success(`Iscrizione annullata per il torneo: ${tournament.name}`);
        
        // Aggiorna lo stato
        setRegisteredTournaments(prev => 
          prev.filter(t => t.id !== tournamentId)
        );
      } else {
        toast.error("Non è stato possibile annullare l'iscrizione");
      }
    } else {
      const success = dataService.registerPlayerForTournament(tournamentId, user.id);
      if (success) {
        toast.success(`Iscrizione completata per il torneo: ${tournament.name}`);
        
        // Aggiorna lo stato
        setRegisteredTournaments(prev => 
          [...prev, tournament]
        );
      } else {
        if (!tournament.registrationOpen) {
          toast.error("Le iscrizioni per questo torneo sono chiuse");
        } else if (tournament.maxPlayers && tournament.registeredPlayers && 
                  tournament.registeredPlayers.length >= tournament.maxPlayers) {
          toast.error("Questo torneo ha raggiunto il numero massimo di partecipanti");
        } else {
          toast.error("Non è stato possibile completare l'iscrizione");
        }
      }
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Il tuo profilo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 card-hover">
            <CardHeader>
              <CardTitle>Informazioni personali</CardTitle>
              <CardDescription>I tuoi dati di profilo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p>{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ruolo</p>
                <p>{user.role === 'admin' ? 'Amministratore' : 'Giocatore'}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Modifica profilo
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="md:col-span-2 card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrophyIcon className="h-5 w-5 text-yellow-500" />
                Prossimi tornei
              </CardTitle>
              <CardDescription>Tornei disponibili per l'iscrizione</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTournaments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingTournaments.map((tournament) => {
                    const isRegistered = tournament.registeredPlayers?.includes(user.id);
                    const isRegistrationFull = tournament.maxPlayers && 
                                               tournament.registeredPlayers && 
                                               tournament.registeredPlayers.length >= tournament.maxPlayers;
                    const registeredCount = tournament.registeredPlayers?.length || 0;
                    const spotsLeft = tournament.maxPlayers ? tournament.maxPlayers - registeredCount : null;
                    
                    return (
                      <div 
                        key={tournament.id} 
                        className="flex items-start justify-between p-4 border rounded-md hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex gap-3">
                          <div className="mt-1">
                            <TrophyIcon className="h-5 w-5 text-yellow-500" />
                          </div>
                          <div>
                            <h3 className="font-medium">{tournament.name}</h3>
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{tournament.date ? new Date(tournament.date).toLocaleDateString() : 'Data da definire'}</span>
                              </div>
                              
                              {tournament.maxPlayers && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Iscritti:</span>{" "}
                                  <span className={`font-medium ${isRegistrationFull ? 'text-destructive' : ''}`}>
                                    {registeredCount}/{tournament.maxPlayers}
                                  </span>
                                  {spotsLeft !== null && spotsLeft > 0 && (
                                    <span className="text-muted-foreground"> ({spotsLeft} posti disponibili)</span>
                                  )}
                                </div>
                              )}
                              
                              {isRegistered && (
                                <div className="flex items-center gap-1 text-sm text-green-500">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Sei iscritto</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant={isRegistered ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleRegistration(tournament.id)}
                          disabled={!isRegistered && isRegistrationFull}
                        >
                          {isRegistered ? "Annulla iscrizione" : "Iscriviti"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nessun torneo disponibile al momento</p>
                  <p className="text-sm mt-2">Controlla più tardi per nuovi tornei</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3 card-hover">
            <CardHeader>
              <CardTitle>I tuoi tornei</CardTitle>
              <CardDescription>Tornei a cui sei iscritto</CardDescription>
            </CardHeader>
            <CardContent>
              {registeredTournaments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome torneo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registeredTournaments.map(tournament => (
                      <TableRow key={tournament.id}>
                        <TableCell className="font-medium">{tournament.name}</TableCell>
                        <TableCell>
                          {tournament.date 
                            ? new Date(tournament.date).toLocaleDateString() 
                            : new Date(tournament.created).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {tournament.registrationOpen 
                            ? <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Iscrizioni aperte</Badge>
                            : <Badge variant="outline" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">In corso</Badge>
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline"
                            size="sm" 
                            onClick={() => handleRegistration(tournament.id)}
                          >
                            Annulla iscrizione
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Non sei iscritto a nessun torneo</p>
                  <p className="text-sm mt-2">Iscriviti a un torneo per vederlo qui</p>
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

export default Profile;
