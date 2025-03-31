
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Anchor } from "lucide-react";

interface PlayerCardProps {
  name: string;
  photoUrl?: string;
  position?: number;
  points?: number;
  isQualified?: boolean;
  size?: "sm" | "md" | "lg";
  showPoints?: boolean;
  showPosition?: boolean;
}

export function PlayerCard({
  name,
  photoUrl,
  position,
  points,
  isQualified = false,
  size = "md",
  showPoints = false,
  showPosition = false,
}: PlayerCardProps) {
  const getAvatarSize = () => {
    switch (size) {
      case "sm":
        return "h-6 w-6 mr-1.5";
      case "lg":
        return "h-10 w-10 mr-2";
      case "md":
      default:
        return "h-8 w-8 mr-2";
    }
  };

  const avatarSize = getAvatarSize();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Link to={`/player/${encodeURIComponent(name)}`} className="group block">
      <div className="flex items-center">
        <Avatar className={`${avatarSize} pirate-avatar`}>
          {photoUrl ? (
            <AvatarImage src={photoUrl} alt={name} />
          ) : (
            <AvatarFallback className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex items-center">
          <span className="group-hover:text-primary transition-colors font-medium">
            {name}
          </span>
          {isQualified && (
            <span className="ml-1.5" title="Qualificato One Piece">
              <Anchor className="h-3.5 w-3.5 text-qualifiers" />
            </span>
          )}
          {showPosition && position !== undefined && (
            <span className="ml-2 text-sm text-muted-foreground">
              {position}° posto
            </span>
          )}
          {showPoints && points !== undefined && (
            <span className="ml-2 text-sm text-muted-foreground">
              {points} punti
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
