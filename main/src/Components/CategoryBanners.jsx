import { Link } from 'react-router-dom'
import {  ArrowRight } from 'lucide-react'

const BANNERS = [
  {
    to: '/categoria/vinil',
    title: 'Vinis',
    subtitle: 'para os mais antigos e colecionadores',
    image: 'https://p2.trrsf.com/image/fget/cf/1200/630/middle/images.terra.com/2024/02/02/841069784-vinil-2-iudmila-chernetska.jpg',
    overlay: 'from-purple-900/85 via-purple-900/50 to-purple-950/80',
    accent: 'text-purple-200',
  },
  {
    to: '/categoria/cds-importados-e-nacionais',
    title: 'CDs',
    subtitle: 'Importados e nacionais',
    image: 'https://cdn.pixabay.com/photo/2015/10/23/17/28/cd-1003342_1280.jpg',
    overlay: 'from-cyan-900/85 via-blue-900/50 to-slate-950/80',
    accent: 'text-cyan-200',
  },
  {
    to: '/categoria/produtos-licenciados',
    title: 'Merchandise',
    subtitle: 'Oficial das suas bandas',
    image: 'https://img.freepik.com/premium-photo/rock-music-band-merchandise-tshirt_1029473-186561.jpg',
    overlay: 'from-amber-900/85 via-orange-900/50 to-rose-950/80',
    accent: 'text-amber-200',
  },
]

const CategoryBanners = () => (
  <section className="mb-10 mt-2">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {BANNERS.map(({ to, title, subtitle, image, overlay, accent }) => (
        <Link
          key={to}
          to={to}
          className="group relative overflow-hidden rounded-2xl glass-card no-underline h-44 sm:h-52 flex flex-col justify-end p-6 hover:-translate-y-0.5 transition-transform duration-300"
        >

          <img
            src={image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${overlay}`} />

          <div className="relative z-10">
            <p className={`text-xs font-semibold uppercase tracking-widest ${accent} mb-1 drop-shadow`}>{subtitle}</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 drop-shadow-lg">{title}</h3>
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
