
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { dataService } from "@/lib/data-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminPlayerControls } from "@/components/admin-player-controls";
import { useAuth } from "@/lib/auth-context";

interface DeckList {
  tournamentId: string;
  tournamentName: string;
  imageUrl: string;
}

const PlayerDetail = () => {
  const { playerName } = useParams<{ playerName: string }>();
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState<ReturnType<typeof dataService.getPlayerByName>>();
  const [participationsData, setParticipationsData] = useState<{ name: string; position: number }[]>([]);
  const [deckLists, setDeckLists] = useState<DeckList[]>([]);
  const { isAdmin } = useAuth();

  const loadPlayerData = useCallback(() => {
    if (playerName) {
      const decodedName = decodeURIComponent(playerName);
      const data = dataService.getPlayerByName(decodedName);
      
      if (data) {
        setPlayerData(data);
        
        // Prepare data for chart
        const chartData = data.tournaments.map(t => ({
          name: t.tournament.name.slice(0, 10) + (t.tournament.name.length > 10 ? '...' : ''),
          position: t.position
        }));
        
        setParticipationsData(chartData);
        
        // Mock deck lists
        // In a real app, this would come from the database
        const mockDeckLists = data.tournaments
          .filter((_, index) => index % 2 === 0) // Just for demo, add deck lists for some tournaments
          .map(t => ({
            tournamentId: t.tournament.id,
            tournamentName: t.tournament.name,
            imageUrl: "/placeholder.svg" // In a real app, this would be an actual image
          }));
        
        setDeckLists(mockDeckLists);
      } else {
        navigate("/404");
      }
    }
  }, [playerName, navigate]);

  useEffect(() => {
    loadPlayerData();
  }, [loadPlayerData]);

  if (!playerData) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dettagli giocatore */}
          <Card className="md:col-span-1 pirate-card">
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header">Profilo Giocatore</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center flex-col justify-center mb-6">
                <Avatar className="h-32 w-32 pirate-avatar mb-4">
                  {playerData.player.photoUrl ? (
                    <AvatarImage src={playerData.player.photoUrl} alt={playerData.player.name} />
                  ) : (
                    <AvatarFallback className="text-4xl bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                      {playerData.player.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h2 className="text-2xl font-bold font-pirate text-amber-900 dark:text-amber-500">
                  {playerData.player.name}
                </h2>
              </div>
              
              <div className="space-y-4 border-t border-amber-200/50 dark:border-amber-800/50 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tornei disputati:</span>
                  <span className="font-medium">{playerData.tournaments.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Punti totali:</span>
                  <span className="font-medium">{playerData.player.points}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Miglior posizione:</span>
                  <span className="font-medium">
                    {Math.min(...playerData.tournaments.map(t => t.position))}°
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">One Piece:</span>
                  <span className="font-medium">
                    {playerData.tournaments.some(t => t.qualified) ? "Sì" : "No"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Storico partecipazioni */}
          <Card className="md:col-span-2 pirate-card">
            <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
              <CardTitle className="pirate-header">Storico Tornei</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {playerData.tournaments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nessun torneo disponibile
                </p>
              ) : (
                <>
                  <div className="h-[250px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={participationsData}
                        margin={{
                          top: 5,
                          right: 20,
                          left: 0,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#d6c9a8" />
                        <XAxis dataKey="name" stroke="#9c6c31" />
                        <YAxis 
                          stroke="#9c6c31" 
                          domain={[0, 'dataMax + 1']}
                          reversed 
                          allowDecimals={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#f8f5e6', 
                            borderColor: '#d6c9a8',
                            color: '#7c5a2c'
                          }} 
                        />
                        <Line
                          type="monotone"
                          dataKey="position"
                          stroke="#d97706"
                          strokeWidth={3}
                          activeDot={{ r: 8, fill: '#d97706' }}
                          dot={{ r: 6, fill: '#d97706' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <Table className="pirate-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Torneo</TableHead>
                        <TableHead>Posizione</TableHead>
                        <TableHead>Punti</TableHead>
                        <TableHead>One Piece</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {playerData.tournaments.map((t, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {t.tournament.name}
                            {t.tournament.challongeUrl && (
                              <a 
                                href={t.tournament.challongeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 ml-2 text-xs"
                              >
                                (Challonge)
                              </a>
                            )}
                          </TableCell>
                          <TableCell>{t.position}°</TableCell>
                          <TableCell>{t.points}</TableCell>
                          <TableCell>{t.qualified ? "Sì" : "No"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Deck lists */}
          {deckLists.length > 0 && (
            <Card className="md:col-span-3 pirate-card">
              <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50">
                <CardTitle className="pirate-header">Deck List</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {deckLists.map((deck, idx) => (
                    <div key={idx} className="treasure-box">
                      <div className="mb-2">
                        <h3 className="font-medium text-amber-900 dark:text-amber-400">
                          {deck.tournamentName}
                        </h3>
                      </div>
                      <AspectRatio ratio={3/4} className="overflow-hidden rounded-md border border-amber-200/50 dark:border-amber-800/50">
                        <img 
                          src={deck.imageUrl} 
                          alt={`Deck list per ${deck.tournamentName}`} 
                          className="object-cover w-full h-full"
                        />
                      </AspectRatio>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Admin controls */}
          {isAdmin && (
            <AdminPlayerControls 
              playerName={playerData.player.name} 
              onProfileUpdate={loadPlayerData}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PlayerDetail;
