
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t mt-auto py-6 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Lega dello Stretto. Tutti i diritti riservati.
            </p>
          </div>
          <div className="flex gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link to="/tornei" className="text-sm text-muted-foreground hover:text-foreground">
              Tornei
            </Link>
            <Link to="/regolamento" className="text-sm text-muted-foreground hover:text-foreground">
              Regolamento
            </Link>
            <Link to="/contatti" className="text-sm text-muted-foreground hover:text-foreground">
              Contatti
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
