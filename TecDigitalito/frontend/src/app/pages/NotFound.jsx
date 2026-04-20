import { Link } from 'react-router'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Página no encontrada</p>
      <Link to="/" className="text-primary hover:underline font-medium">
        Volver al inicio
      </Link>
    </div>
  )
}
