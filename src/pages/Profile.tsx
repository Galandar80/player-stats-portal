
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { dataService, Tournament } from "@/lib/data-service";
import { CalendarIcon, TrophyIcon } from "lucide-react";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate("/login");
    }

    // Load tournaments
    if (isAuthenticated) {
      const tournamentsData = dataService.getTournaments();
      setTournaments(tournamentsData);
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // For the mock implementation, let's simulate the user's participation in tournaments
  const upcomingTournaments = tournaments.filter((_, index) => index % 2 === 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Il tuo profilo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
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
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Prossimi tornei</CardTitle>
              <CardDescription>Tornei disponibili per l'iscrizione</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTournaments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingTournaments.map((tournament) => (
                    <div 
                      key={tournament.id} 
                      className="flex items-start justify-between p-4 border rounded-md"
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">
                          <TrophyIcon className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">{tournament.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{new Date(tournament.created).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm">Iscriviti</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nessun torneo disponibile al momento</p>
                  <p className="text-sm mt-2">Controlla più tardi per nuovi tornei</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Le tue partecipazioni</CardTitle>
              <CardDescription>Storia delle tue partecipazioni ai tornei</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 p-4 font-medium border-b">
                  <div>Torneo</div>
                  <div>Data</div>
                  <div>Posizione</div>
                  <div>Punti</div>
                </div>
                <div className="p-4 text-muted-foreground text-center">
                  <p>Nessuna partecipazione registrata</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
