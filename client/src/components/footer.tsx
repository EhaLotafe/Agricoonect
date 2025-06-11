import { Sprout } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-agri-green rounded-full flex items-center justify-center">
                <Sprout className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Agri-Connect RDC</h4>
                <p className="text-sm text-gray-400">Relions les champs aux villes</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              La première plateforme congolaise qui connecte directement les agriculteurs aux consommateurs, 
              pour des produits frais et des prix équitables.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-agri-green transition-colors">
                <i className="fab fa-facebook-f text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-agri-green transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-agri-green transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-agri-green transition-colors">
                <i className="fab fa-linkedin-in text-xl"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-semibold mb-4">Liens rapides</h5>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    Accueil
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    Produits
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/register">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    Devenir vendeur
                  </span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Centre d'aide
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Conditions d'utilisation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-semibold mb-4">Contact</h5>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400">
                <i className="fas fa-phone mr-2"></i>
                <span>+243 123 456 789</span>
              </li>
              <li className="flex items-center text-gray-400">
                <i className="fas fa-envelope mr-2"></i>
                <span>info@agri-connect.cd</span>
              </li>
              <li className="flex items-center text-gray-400">
                <i className="fas fa-map-marker-alt mr-2"></i>
                <span>Kinshasa, RDC</span>
              </li>
              <li className="flex items-center text-gray-400">
                <i className="fas fa-mobile-alt mr-2"></i>
                <span>USSD: *123*2024#</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; 2024 Agri-Connect RDC. Tous droits réservés. | 
            <span className="text-agri-green"> Cultivons ensemble l'avenir de l'agriculture congolaise</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
