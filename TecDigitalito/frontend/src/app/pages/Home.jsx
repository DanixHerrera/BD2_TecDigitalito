import QuickAccess from "../components/QuickAccess";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Bienvenido a TecDigitalito</h1>
      <p className="text-muted-foreground">Tu plataforma de cursos virtuales del TEC.</p>
      <QuickAccess />
    </div>
  )
}
