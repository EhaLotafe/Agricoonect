import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sprout, Menu, User, ShoppingBasket, Tractor, Settings } from "lucide-react";
import { useAuth } from "@/App";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const { user, setUser, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    setUser(null);
  };

  const navigationItems = [
    { href: "/", label: "Accueil" },
    { href: "/products", label: "Produits" },
  ];

  const MobileMenu = () => (
    <div className="flex flex-col space-y-4 p-4">
      {navigationItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={location === item.href ? "default" : "ghost"}
            className="w-full justify-start"
          >
            {item.label}
          </Button>
        </Link>
      ))}
      
      {!isAuthenticated ? (
        <>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Connexion
            </Button>
          </Link>
          <Link href="/register">
            <Button className="w-full bg-agri-orange hover:bg-agri-orange/90">
              S'inscrire
            </Button>
          </Link>
        </>
      ) : (
        <>
          {user?.userType === 'farmer' && (
            <Link href="/farmer/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <Tractor className="mr-2 h-4 w-4" />
                Tableau de bord
              </Button>
            </Link>
          )}
          {user?.userType === 'buyer' && (
            <Link href="/buyer/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <ShoppingBasket className="mr-2 h-4 w-4" />
                Mes commandes
              </Button>
            </Link>
          )}
          {user?.userType === 'admin' && (
            <Link href="/admin/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Administration
              </Button>
            </Link>
          )}
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
            Déconnexion
          </Button>
        </>
      )}
    </div>
  );

  return (
    <header className="bg-white shadow-lg border-b-2 border-agri-green sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-12 h-12 bg-agri-green rounded-full flex items-center justify-center">
                <Sprout className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-agri-green">Agri-Connect RDC</h1>
                <p className="text-xs text-gray-500">Relions les champs aux villes</p>
              </div>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "default" : "ghost"}
                  className={location === item.href ? "bg-agri-green hover:bg-agri-green/90" : "text-gray-700 hover:text-agri-green"}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* CTA Buttons & User Menu */}
          <div className="flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="hidden sm:block border-agri-green text-agri-green hover:bg-agri-green hover:text-white"
                  >
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-agri-orange hover:bg-agri-orange/90">
                    S'inscrire
                  </Button>
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user?.firstName} {user?.lastName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm text-gray-600">
                    {user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  
                  {user?.userType === 'farmer' && (
                    <Link href="/farmer/dashboard">
                      <DropdownMenuItem>
                        <Tractor className="mr-2 h-4 w-4" />
                        Tableau de bord
                      </DropdownMenuItem>
                    </Link>
                  )}
                  
                  {user?.userType === 'buyer' && (
                    <Link href="/buyer/dashboard">
                      <DropdownMenuItem>
                        <ShoppingBasket className="mr-2 h-4 w-4" />
                        Mes commandes
                      </DropdownMenuItem>
                    </Link>
                  )}
                  
                  {user?.userType === 'admin' && (
                    <Link href="/admin/dashboard">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Administration
                      </DropdownMenuItem>
                    </Link>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <MobileMenu />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
