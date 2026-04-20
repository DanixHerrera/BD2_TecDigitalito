import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Book, MessageSquare, Settings, GraduationCap } from "lucide-react";
import "@/styles/quickAccess.css";

const quickAccessElements = [
    {
        title: "Catálogo",
        icon: Book,
        href: "/catalog"
    },
    {
        title: "Mis Cursos",
        icon: GraduationCap,
        href: "/my-enrollments"
    },
    {
        title: "Mensajes",
        icon: MessageSquare,
        href: "/social/user-messages"
    },
    {
        title: "Configuración",
        icon: Settings,
        href: "/settings"
    }
]

export default function QuickAccess() {
    return (
        <Card className="qa-card">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-foreground/90">Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="qa-grid">
                    {quickAccessElements.map((item) => (
                        <Link
                            key={item.title}
                            to={item.href}
                            className="qa-item"
                        >
                            <item.icon className="qa-icon" />
                            <span className="qa-label">{item.title}</span>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}