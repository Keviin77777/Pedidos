import { Clapperboard } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <Clapperboard className="w-8 h-8 mr-3" />
        <h1 className="text-3xl font-bold tracking-tight">CineAssist</h1>
      </div>
    </header>
  );
};

export default Header;
