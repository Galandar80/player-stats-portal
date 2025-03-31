
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Save, Edit, Image } from "lucide-react";
import { dataService } from "@/lib/data-service";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

interface AdminPlayerControlsProps {
  playerName: string;
  onProfileUpdate: () => void;
}

export const AdminPlayerControls = ({ playerName, onProfileUpdate }: AdminPlayerControlsProps) => {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  if (!isAdmin) return null;
  
  const uploadPlayerPhoto = () => {
    // In a real implementation, this would trigger a file upload dialog
    // For now, we'll simulate it by setting a mock URL
    const mockPhotoUrl = "/placeholder.svg"; // In a real app, this would be an uploaded image
    
    // Assuming we're updating the player in all tournaments they participate in
    const playerData = dataService.getPlayerByName(playerName);
    
    if (playerData) {
      playerData.tournaments.forEach(({ tournament }) => {
        const player = tournament.players.find(p => p.name === playerName);
        if (player) {
          dataService.updatePlayer(tournament.id, player.id, { photoUrl: mockPhotoUrl });
        }
      });
      
      toast.success("Foto profilo aggiornata con successo!");
      onProfileUpdate();
    }
  };
  
  const deletePlayerPhoto = () => {
    if (window.confirm("Sei sicuro di voler rimuovere la foto profilo?")) {
      // Assuming we're updating the player in all tournaments they participate in
      const playerData = dataService.getPlayerByName(playerName);
      
      if (playerData) {
        playerData.tournaments.forEach(({ tournament }) => {
          const player = tournament.players.find(p => p.name === playerName);
          if (player) {
            dataService.updatePlayer(tournament.id, player.id, { photoUrl: undefined });
          }
        });
        
        toast.success("Foto profilo rimossa con successo!");
        onProfileUpdate();
      }
    }
  };
  
  const uploadDeckList = (tournamentId: string) => {
    // In a real implementation, this would trigger a file upload dialog
    // For now, we'll simulate it
    toast.success("Deck list caricata con successo!");
    onProfileUpdate();
    
    // In a real app, you would update the player's deck list in the database
  };
  
  const deleteDeckList = (tournamentId: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questa deck list?")) {
      // In a real implementation, this would delete the deck list from storage
      toast.success("Deck list eliminata con successo!");
      onProfileUpdate();
      
      // In a real app, you would remove the player's deck list reference from the database
    }
  };
  
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Card className="pirate-card mt-6 border-amber-500/30 dark:border-amber-600/50">
      <CardHeader className="pb-3 border-b border-amber-200/50 dark:border-amber-800/50 bg-amber-100/50 dark:bg-amber-900/40">
        <CardTitle className="text-lg text-amber-900 dark:text-amber-500 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Edit className="h-4 w-4" /> Funzioni amministratore
          </span>
          <Button 
            variant="ghost" 
            onClick={toggleEditing} 
            size="sm"
            className="h-8 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-200/50 dark:hover:bg-amber-800/50"
          >
            {isEditing ? "Nascondi" : "Mostra"}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {isEditing && (
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Foto profilo</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={uploadPlayerPhoto}
                className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
              >
                <Upload className="h-3 w-3 mr-1" /> Carica nuova foto
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={deletePlayerPhoto}
                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 bg-red-100/50 dark:bg-red-900/30 hover:bg-red-200/50 dark:hover:bg-red-800/30"
              >
                <X className="h-3 w-3 mr-1" /> Rimuovi foto
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Deck list tornei</h3>
            
            <div className="space-y-3">
              {dataService.getPlayerByName(playerName)?.tournaments.map(({ tournament }) => (
                <div 
                  key={tournament.id} 
                  className="flex flex-wrap items-center justify-between p-2 border border-amber-200/70 dark:border-amber-800/70 rounded-md bg-amber-50/30 dark:bg-amber-900/20"
                >
                  <div className="text-sm">{tournament.name}</div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => uploadDeckList(tournament.id)}
                      className="h-7 text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
                    >
                      <Image className="h-3 w-3 mr-1" /> Carica deck
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteDeckList(tournament.id)}
                      className="h-7 text-xs border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 bg-red-100/50 dark:bg-red-900/30 hover:bg-red-200/50 dark:hover:bg-red-800/30"
                    >
                      <X className="h-3 w-3 mr-1" /> Elimina
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
