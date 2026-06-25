import { Link } from 'react-router-dom'
import { Disc3, Disc, Shirt, ArrowRight } from 'lucide-react'

const BANNERS = [
  {
    to: '/categoria/vinil',
    title: 'Vinis',
    subtitle: 'O som analógico',
    Icon: Disc3,
    gradient: 'from-purple-600/60 via-purple-900/40 to-blue-900/60',
    accent: 'text-purple-300',
  },
  {
    to: '/categoria/cds-importados-e-nacionais',
    title: 'CDs',
    subtitle: 'Importados e nacionais',
    Icon: Disc,
    gradient: 'from-cyan-600/60 via-blue-900/40 to-slate-900/60',
    accent: 'text-cyan-300',
  },
  {
    to: '/categoria/produtos-licenciados',
    title: 'Merchandise',
    subtitle: 'Oficial das suas bandas',
    Icon: Shirt,
    gradient: 'from-amber-600/60 via-orange-900/40 to-rose-900/60',
    accent: 'text-amber-300',
  },
]

const CategoryBanners = () => (
  <section className="mb-10 mt-2">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {BANNERS.map(({ to, title, subtitle, Icon, gradient, accent }) => (
        <Link
          key={to}
          to={to}
          className={`
            group relative overflow-hidden rounded-2xl glass-card no-underline
            h-44 sm:h-52 flex flex-col justify-end p-6
            hover:-translate-y-0.5 transition-transform duration-300
          `}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`} />

          <Icon
            size={120}
            className={`absolute -top-4 -right-4 ${accent} opacity-25 group-hover:opacity-40 group-hover:rotate-12 transition-all duration-500`}
            strokeWidth={1.25}
          />

          <div className="relative z-10">
            <p className={`text-xs font-semibold uppercase tracking-widest ${accent} mb-1`}>{subtitle}</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 drop-shadow">{title}</h3>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-white/15 backdrop-blur-sm border border-white/25 px-3 py-1.5 rounded-full group-hover:bg-white group-hover:text-black transition-colors duration-200">
              Comprar agora
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  </section>
)

export default CategoryBanners
