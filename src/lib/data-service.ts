
export type Player = {
  id: string;
  name: string;
  points: number;
  position: number;
  qualified: boolean;
  photoUrl?: string;
};

export type Tournament = {
  id: string;
  name: string;
  created: string;
  players: Player[];
  registrationOpen: boolean;
  maxPlayers?: number;
  date?: string;
  challongeUrl?: string;
  registeredPlayers?: string[];
};

export type Reward = {
  threshold: number;
  prize: string;
};

const DEFAULT_TOURNAMENTS: Tournament[] = [
  {
    id: "1",
    name: "I 4 Imperatori",
    created: new Date('2023-01-15').toISOString(),
    players: [
      { id: "p1", name: "Angelo Truscello", points: 120, position: 1, qualified: true, photoUrl: "/lovable-uploads/a23dde70-746a-40c1-9cea-82d425ae82fc.png" },
      { id: "p2", name: "Samuele Sindona", points: 80, position: 2, qualified: false },
      { id: "p3", name: "Adriano Zingales", points: 60, position: 3, qualified: false },
      { id: "p4", name: "Matteo Trimarchi", points: 60, position: 4, qualified: false }
    ],
    registrationOpen: false,
    challongeUrl: "https://challonge.com/it/4imperatori"
  },
  {
    id: "2",
    name: "Torneo Maggio 2023",
    created: new Date('2023-05-20').toISOString(),
    players: [
      { id: "p5", name: "Andrea Mazzu", points: 40, position: 1, qualified: false },
      { id: "p6", name: "Valentino Fusco", points: 40, position: 2, qualified: false },
      { id: "p1", name: "Angelo Truscello", points: 0, position: 3, qualified: false },
      { id: "p7", name: "Felice Zanola", points: 20, position: 4, qualified: false }
    ],
    registrationOpen: false,
    challongeUrl: "https://challonge.com/it/maggio2023"
  },
  {
    id: "3",
    name: "Torneo Giugno 2023",
    created: new Date('2023-06-15').toISOString(),
    players: [
      { id: "p8", name: "Francesco Mangione", points: 20, position: 1, qualified: false },
      { id: "p9", name: "Salvatore Rossello", points: 10, position: 2, qualified: false },
      { id: "p10", name: "Gioele Gaipa", points: 10, position: 3, qualified: false },
      { id: "p11", name: "Gabriele Calanna", points: 10, position: 4, qualified: false }
    ],
    registrationOpen: false,
    challongeUrl: "https://challonge.com/it/giugno2023"
  },
  {
    id: "4",
    name: "Torneo Estate 2023",
    created: new Date('2023-07-10').toISOString(),
    players: [],
    registrationOpen: true,
    maxPlayers: 16,
    date: new Date('2023-07-25').toISOString(),
    registeredPlayers: ["2"]
  }
];

const DEFAULT_REWARDS: Reward[] = [
  { threshold: 800, prize: "8 bustine" },
  { threshold: 720, prize: "7 bustine" },
  { threshold: 630, prize: "6 bustine" },
  { threshold: 540, prize: "5 bustine" },
  { threshold: 450, prize: "4 bustine" },
  { threshold: 400, prize: "3 bustine" },
  { threshold: 350, prize: "2 bustine" },
  { threshold: 250, prize: "1 bustina" }
];

export class DataService {
  private tournaments: Tournament[];
  private rewards: Reward[];
  
  constructor() {
    const storedTournaments = localStorage.getItem('tournaments');
    this.tournaments = storedTournaments ? JSON.parse(storedTournaments) : DEFAULT_TOURNAMENTS;
    
    const storedRewards = localStorage.getItem('rewards');
    this.rewards = storedRewards ? JSON.parse(storedRewards) : DEFAULT_REWARDS;
  }
  
  private saveToStorage() {
    localStorage.setItem('tournaments', JSON.stringify(this.tournaments));
    localStorage.setItem('rewards', JSON.stringify(this.rewards));
  }
  
  // Tournament methods
  getTournaments(): Tournament[] {
    return [...this.tournaments];
  }
  
  getUpcomingTournaments(): Tournament[] {
    return this.tournaments.filter(t => t.registrationOpen);
  }
  
  getTournament(id: string): Tournament | undefined {
    return this.tournaments.find(t => t.id === id);
  }
  
  createTournament(name: string, date?: string, maxPlayers?: number, challongeUrl?: string): Tournament {
    const newTournament = {
      id: Date.now().toString(),
      name,
      created: new Date().toISOString(),
      players: [],
      registrationOpen: true,
      maxPlayers,
      date,
      challongeUrl,
      registeredPlayers: []
    };
    
    this.tournaments.push(newTournament);
    this.saveToStorage();
    return newTournament;
  }
  
  updateTournament(id: string, updates: Partial<Tournament>): Tournament | undefined {
    const index = this.tournaments.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    
    this.tournaments[index] = { ...this.tournaments[index], ...updates };
    this.saveToStorage();
    return this.tournaments[index];
  }
  
  deleteTournament(id: string): boolean {
    const initialLength = this.tournaments.length;
    this.tournaments = this.tournaments.filter(t => t.id !== id);
    
    const deleted = initialLength > this.tournaments.length;
    if (deleted) {
      this.saveToStorage();
    }
    
    return deleted;
  }
  
  registerPlayerForTournament(tournamentId: string, userId: string): boolean {
    const tournamentIndex = this.tournaments.findIndex(t => t.id === tournamentId);
    if (tournamentIndex === -1) return false;
    
    const tournament = this.tournaments[tournamentIndex];
    
    // Verificare se la registrazione è aperta
    if (!tournament.registrationOpen) return false;
    
    // Verificare se ci sono posti disponibili
    if (tournament.maxPlayers && 
        tournament.registeredPlayers && 
        tournament.registeredPlayers.length >= tournament.maxPlayers) {
      return false;
    }
    
    // Verificare se il giocatore è già registrato
    if (!tournament.registeredPlayers) {
      tournament.registeredPlayers = [];
    }
    
    if (tournament.registeredPlayers.includes(userId)) {
      return false;
    }
    
    // Aggiungere il giocatore
    tournament.registeredPlayers.push(userId);
    this.saveToStorage();
    return true;
  }
  
  unregisterPlayerFromTournament(tournamentId: string, userId: string): boolean {
    const tournamentIndex = this.tournaments.findIndex(t => t.id === tournamentId);
    if (tournamentIndex === -1) return false;
    
    const tournament = this.tournaments[tournamentIndex];
    
    if (!tournament.registeredPlayers) return false;
    
    const playerIndex = tournament.registeredPlayers.indexOf(userId);
    if (playerIndex === -1) return false;
    
    tournament.registeredPlayers.splice(playerIndex, 1);
    this.saveToStorage();
    return true;
  }
  
  // Player methods
  getPlayers(tournamentId: string): Player[] {
    const tournament = this.getTournament(tournamentId);
    return tournament ? [...tournament.players] : [];
  }
  
  getAllPlayers(): Player[] {
    const allPlayers = new Map<string, Player>();
    
    this.tournaments.forEach(tournament => {
      tournament.players.forEach(player => {
        if (allPlayers.has(player.name)) {
          const existing = allPlayers.get(player.name)!;
          allPlayers.set(player.name, {
            ...existing,
            points: existing.points + player.points,
            photoUrl: player.photoUrl || existing.photoUrl
          });
        } else {
          allPlayers.set(player.name, { ...player });
        }
      });
    });
    
    return Array.from(allPlayers.values());
  }
  
  getPlayerByName(name: string): { 
    player: Player, 
    tournaments: { 
      tournament: Tournament, 
      position: number, 
      points: number, 
      qualified: boolean 
    }[] 
  } | undefined {
    const playerTournaments: { 
      tournament: Tournament, 
      position: number, 
      points: number, 
      qualified: boolean 
    }[] = [];
    
    let playerDetails: Player | undefined;
    
    this.tournaments.forEach(tournament => {
      const playerInTournament = tournament.players.find(p => p.name === name);
      
      if (playerInTournament) {
        if (!playerDetails) {
          playerDetails = { ...playerInTournament };
        } else {
          playerDetails.points += playerInTournament.points;
          if (!playerDetails.photoUrl && playerInTournament.photoUrl) {
            playerDetails.photoUrl = playerInTournament.photoUrl;
          }
        }
        
        playerTournaments.push({
          tournament,
          position: playerInTournament.position,
          points: playerInTournament.points,
          qualified: playerInTournament.qualified
        });
      }
    });
    
    if (!playerDetails) return undefined;
    
    return {
      player: playerDetails,
      tournaments: playerTournaments
    };
  }
  
  getPlayerParticipations(): Record<string, number[]> {
    const participations: Record<string, number[]> = {};
    
    // Sort tournaments by creation date
    const sortedTournaments = [...this.tournaments].sort(
      (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
    );
    
    // Get all unique player names
    const allPlayerNames = new Set<string>();
    sortedTournaments.forEach(tournament => {
      tournament.players.forEach(player => {
        allPlayerNames.add(player.name);
      });
    });
    
    // Initialize positions array for each player
    allPlayerNames.forEach(name => {
      participations[name] = sortedTournaments.map(tournament => {
        const player = tournament.players.find(p => p.name === name);
        return player ? player.position : 0;
      });
    });
    
    return participations;
  }
  
  getQualifiedPlayers(): { name: string, tournament: string }[] {
    const qualifiedPlayers: { name: string, tournament: string }[] = [];
    
    this.tournaments.forEach(tournament => {
      tournament.players.forEach(player => {
        if (player.qualified) {
          qualifiedPlayers.push({
            name: player.name,
            tournament: tournament.name
          });
        }
      });
    });
    
    return qualifiedPlayers;
  }
  
  addPlayer(tournamentId: string, name: string): Player | undefined {
    const tournamentIndex = this.tournaments.findIndex(t => t.id === tournamentId);
    if (tournamentIndex === -1) return undefined;
    
    const newPlayer = {
      id: Date.now().toString(),
      name,
      points: 0,
      position: 0,
      qualified: false
    };
    
    this.tournaments[tournamentIndex].players.push(newPlayer);
    this.saveToStorage();
    return newPlayer;
  }
  
  updatePlayer(tournamentId: string, playerId: string, updates: Partial<Player>): Player | undefined {
    const tournamentIndex = this.tournaments.findIndex(t => t.id === tournamentId);
    if (tournamentIndex === -1) return undefined;
    
    const playerIndex = this.tournaments[tournamentIndex].players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return undefined;
    
    this.tournaments[tournamentIndex].players[playerIndex] = {
      ...this.tournaments[tournamentIndex].players[playerIndex],
      ...updates
    };
    
    this.saveToStorage();
    return this.tournaments[tournamentIndex].players[playerIndex];
  }
  
  deletePlayer(tournamentId: string, playerId: string): boolean {
    const tournamentIndex = this.tournaments.findIndex(t => t.id === tournamentId);
    if (tournamentIndex === -1) return false;
    
    const initialLength = this.tournaments[tournamentIndex].players.length;
    this.tournaments[tournamentIndex].players = this.tournaments[tournamentIndex].players.filter(
      p => p.id !== playerId
    );
    
    const deleted = initialLength > this.tournaments[tournamentIndex].players.length;
    if (deleted) {
      this.saveToStorage();
    }
    
    return deleted;
  }
  
  // Reward methods
  getRewards(): Reward[] {
    return [...this.rewards];
  }
  
  updateReward(index: number, updates: Partial<Reward>): Reward | undefined {
    if (index < 0 || index >= this.rewards.length) return undefined;
    
    this.rewards[index] = { ...this.rewards[index], ...updates };
    this.saveToStorage();
    return this.rewards[index];
  }
  
  // Metodi per verificare la registrazione degli utenti
  isPlayerRegisteredForTournament(tournamentId: string, userId: string): boolean {
    const tournament = this.getTournament(tournamentId);
    if (!tournament || !tournament.registeredPlayers) return false;
    
    return tournament.registeredPlayers.includes(userId);
  }
  
  getRegisteredTournaments(userId: string): Tournament[] {
    return this.tournaments.filter(tournament => 
      tournament.registeredPlayers && tournament.registeredPlayers.includes(userId)
    );
  }
}

export const dataService = new DataService();
