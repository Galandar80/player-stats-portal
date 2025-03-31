
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";

export function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <Link to="/" className="text-xl font-bold">
            Lega dello Stretto
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <Link to="/" className="hover:underline">
            Classifiche
          </Link>
          {isAuthenticated && (
            <Link to="/profilo" className="hover:underline">
              Profilo
            </Link>
          )}
          {isAuthenticated && isAdmin && (
            <Link to="/admin" className="hover:underline">
              Amministrazione
            </Link>
          )}

          <div className="flex items-center gap-2 ml-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm hidden md:block">
                  Ciao, {user?.name}
                </span>
                <Button variant="outline" onClick={logout}>
                  Esci
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link to="/login">Accedi</Link>
                </Button>
                <Button asChild>
                  <Link to="/registrati">Registrati</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
