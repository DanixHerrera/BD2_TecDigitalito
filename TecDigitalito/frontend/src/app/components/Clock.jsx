import { Clock as ClockIcon } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="flex items-center gap-2">
            <ClockIcon size={18} />
            <span className="text-sm font-medium">{time.toLocaleTimeString()}</span>
        </div>
    )
}