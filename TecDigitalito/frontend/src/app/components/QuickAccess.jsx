import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Book, MessageSquare, Settings, GraduationCap } from "lucide-react";

const quickAccessElements = [
    {
        title: "Mis Cursos",
        icon: GraduationCap,
        href: "/my-enrollments"
    },
    {
        title: "Mensajes",
        icon: MessageSquare,
        href: "/social/friends"
    },
    {
        title: "Configuración",
        icon: Settings,
        href: "/settings"
    }
]

export default function QuickAccess() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Acceso Rápido</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Nota: faltan los botones</p>
            </CardContent>
        </Card>
    )
}