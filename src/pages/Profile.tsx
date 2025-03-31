
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { dataService, Tournament } from "@/lib/data-service";
import { CalendarIcon, TrophyIcon, CheckCircle, XCircle, Upload, User, FileImage } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";

interface UserDeckList {
  tournamentId: string;
  imageUrl: string;
}

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [registeredTournaments, setRegisteredTournaments] = useState<Tournament[]>([]);
  const [userDeckLists, setUserDeckLists] = useState<UserDeckList[]>([]);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | undefined>();
  
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
      
      // In a real app, these would come from the data service
      // This is just a placeholder for demonstration
      setProfilePhotoUrl(user.photoUrl);
      
      // Mock deck lists
      const mockDeckLists: UserDeckList[] = registered.slice(0, 2).map(tournament => ({
        tournamentId: tournament.id,
        imageUrl: "/placeholder.svg" // In a real app, this would be the actual image URL
      }));
      setUserDeckLists(mockDeckLists);
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
  
  const uploadProfilePhoto = () => {
    // In a real implementation, this would trigger a file upload dialog
    // For now, we'll simulate it by setting a mock URL
    const mockPhotoUrl = "/placeholder.svg"; // In a real app, this would be an uploaded image
    setProfilePhotoUrl(mockPhotoUrl);
    
    // In a real app, you would update the user's profile in the database
    toast.success("Foto profilo caricata con successo!");
  };
  
  const uploadDeckList = (tournamentId: string) => {
    // In a real implementation, this would trigger a file upload dialog
    // For now, we'll simulate it by adding a mock deck list
    const existingIndex = userDeckLists.findIndex(deck => deck.tournamentId === tournamentId);
    
    if (existingIndex >= 0) {
      // Replace existing deck list
      const updatedDeckLists = [...userDeckLists];
      updatedDeckLists[existingIndex] = {
        tournamentId,
        imageUrl: "/placeholder.svg" // In a real app, this would be an uploaded image
      };
      setUserDeckLists(updatedDeckLists);
    } else {
      // Add new deck list
      setUserDeckLists([
        ...userDeckLists,
        {
          tournamentId,
          imageUrl: "/placeholder.svg" // In a real app, this would be an uploaded image
        }
      ]);
    }
    
    toast.success("Deck list caricata con successo!");
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-pirate mb-6 text-amber-900 dark:text-amber-500">Il tuo profilo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 pirate-card animate-fade-in">
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header">Informazioni personali</CardTitle>
              <CardDescription>I tuoi dati di profilo</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 pirate-avatar">
                    {profilePhotoUrl ? (
                      <AvatarImage src={profilePhotoUrl} alt={user.name} />
                    ) : (
                      <AvatarFallback className="text-4xl bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <Button 
                    size="icon"
                    variant="outline"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-200/70 dark:hover:bg-amber-800/70"
                    onClick={uploadProfilePhoto}
                  >
                    <Upload className="h-4 w-4" />
                    <span className="sr-only">Carica foto profilo</span>
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p className="font-medium">{user.name}</p>
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
              <Button 
                variant="outline" 
                className="w-full border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
              >
                <User className="h-4 w-4 mr-2" />
                Modifica profilo
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="md:col-span-2 pirate-card animate-fade-in" style={{animationDelay: "0.1s"}}>
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header flex items-center gap-2">
                <TrophyIcon className="h-5 w-5 text-yellow-500" />
                Prossimi tornei
              </CardTitle>
              <CardDescription>Tornei disponibili per l'iscrizione</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
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
                        className="flex items-start justify-between p-4 border border-amber-200 dark:border-amber-800 rounded-md bg-amber-50/50 dark:bg-amber-900/20 hover:bg-amber-100/50 dark:hover:bg-amber-800/30 transition-colors"
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
                          className={isRegistered ? 
                            "border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-200/50 dark:hover:bg-amber-800/30" : 
                            "bg-amber-700 hover:bg-amber-800 text-amber-50"
                          }
                        >
                          {isRegistered ? "Annulla iscrizione" : "Iscriviti"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground map-bg rounded-lg">
                  <p>Nessun torneo disponibile al momento</p>
                  <p className="text-sm mt-2">Controlla più tardi per nuovi tornei</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3 pirate-card animate-fade-in" style={{animationDelay: "0.2s"}}>
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header">I tuoi tornei</CardTitle>
              <CardDescription>Tornei a cui sei iscritto</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {registeredTournaments.length > 0 ? (
                <div className="space-y-6">
                  <Table className="pirate-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome torneo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Deck list</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registeredTournaments.map(tournament => {
                        const hasDeckList = userDeckLists.some(deck => deck.tournamentId === tournament.id);
                        
                        return (
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
                            <TableCell>
                              <Button 
                                variant="outline"
                                size="sm" 
                                onClick={() => uploadDeckList(tournament.id)}
                                className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
                              >
                                <FileImage className="h-4 w-4 mr-2" />
                                {hasDeckList ? "Aggiorna deck" : "Carica deck"}
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline"
                                size="sm" 
                                onClick={() => handleRegistration(tournament.id)}
                                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 bg-red-100/50 dark:bg-red-900/30 hover:bg-red-200/50 dark:hover:bg-red-800/30"
                              >
                                Annulla iscrizione
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground map-bg rounded-lg">
                  <p>Non sei iscritto a nessun torneo</p>
                  <p className="text-sm mt-2">Iscriviti a un torneo per vederlo qui</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Le tue deck list */}
          <Card className="md:col-span-3 pirate-card animate-fade-in" style={{animationDelay: "0.3s"}}>
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header">Le tue deck list</CardTitle>
              <CardDescription>Le deck list che hai caricato per i tornei</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {userDeckLists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userDeckLists.map((deck, index) => {
                    const tournament = tournaments.find(t => t.id === deck.tournamentId);
                    return (
                      <div key={index} className="treasure-box overflow-hidden">
                        <div className="mb-2">
                          <h3 className="font-medium text-amber-900 dark:text-amber-400">
                            {tournament?.name || "Torneo"}
                          </h3>
                          <div className="text-sm text-muted-foreground">
                            {tournament ? new Date(tournament.created).toLocaleDateString() : ""}
                          </div>
                        </div>
                        <AspectRatio ratio={3/4} className="overflow-hidden rounded-md border border-amber-200/50 dark:border-amber-800/50">
                          <img 
                            src={deck.imageUrl} 
                            alt={`Deck list per ${tournament?.name || "un torneo"}`}
                            className="object-cover w-full h-full"
                          />
                        </AspectRatio>
                        <div className="mt-3 flex justify-end">
                          <Button 
                            variant="outline"
                            size="sm" 
                            onClick={() => uploadDeckList(deck.tournamentId)}
                            className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Aggiorna
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground map-bg rounded-lg">
                  <p>Non hai ancora caricato deck list</p>
                  <p className="text-sm mt-2">Carica una deck list per i tornei a cui sei iscritto</p>
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
