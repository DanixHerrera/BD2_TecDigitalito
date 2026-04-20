import { Clock as ClockIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import '@/styles/Clock.css'

export default function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="clock-container">
            <ClockIcon size={18} />
            <span className="clock-text">{time.toLocaleTimeString()}</span>
        </div>
    )
}