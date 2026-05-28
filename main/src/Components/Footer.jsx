const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-6 text-center text-xs text-gray-600">
        <p>© {new Date().getFullYear()} Music Store. Desenvolvido por Rafael.</p>
      </div>
    </footer>
  )
}

export default Footer
