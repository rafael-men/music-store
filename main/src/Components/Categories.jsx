import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

const Categories = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    { name: 'Vistos Recentemente',       link: '/vistos-recentemente' },
    { name: 'Black Metal',               link: '/categoria/black-metal' },
    { name: 'Death Metal',               link: '/categoria/death-metal' },
    { name: 'PoP',                       link: '/categoria/pop' },
    { name: 'Brasileira',                link: '/categoria/brasileira' },
    { name: 'Produtos Licenciados',      link: '/categoria/produtos-licenciados' },
    { name: 'Vinil',                     link: '/categoria/vinil' },
    { name: 'CDs Importados e Nacionais',link: '/categoria/cds-importados-e-nacionais' },
    { name: 'Nu Metal',                  link: '/categoria/nu-metal' },
    { name: 'Metal Progressivo',         link: '/categoria/metal-progressivo' },
  ];

  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between lg:justify-start lg:gap-2">
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest hidden lg:block mr-2 shrink-0">
            Categorias
          </span>
          <button
            className="text-gray-300 lg:hidden flex items-center gap-2 text-sm py-3"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={20} />
            <span>Categorias</span>
          </button>
          <div className="hidden lg:flex lg:flex-row lg:flex-wrap lg:gap-0 lg:py-1">
            {categories.map((category) => (
              <Link
                key={category.link}
                to={category.link}
                className="text-xs font-medium text-gray-300 no-underline hover:text-white hover:bg-gray-700 rounded px-3 py-2 transition-all duration-200 whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-800 py-2 grid grid-cols-2 gap-1">
            {categories.map((category) => (
              <Link
                key={category.link}
                to={category.link}
                onClick={() => setIsMenuOpen(false)}
                className="text-xs font-medium text-gray-300 no-underline hover:text-white hover:bg-gray-700 rounded px-3 py-2 transition-all duration-200"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
