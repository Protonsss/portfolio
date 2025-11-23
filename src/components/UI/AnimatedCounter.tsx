import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
    value: string;
    color: string;
    delay?: number;
}

export function AnimatedCounter({ value, color, delay = 0 }: AnimatedCounterProps) {
    // Extract number from value (e.g., "$100,000+" -> 100000)
    const match = value.match(/[\d,]+/);
    const numericValue = match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
    const suffix = value.replace(/[\d,]+/, '').trim();
    const prefix = value.split(/[\d,]+/)[0];

    const [count, setCount] = useState(0);

    useEffect(() => {
        if (numericValue === 0) return;

        const timeout = setTimeout(() => {
            const duration = 2000;
            const steps = 60;
            const increment = numericValue / steps;
            let current = 0;

            const interval = setInterval(() => {
                current += increment;
                if (current >= numericValue) {
                    setCount(numericValue);
                    clearInterval(interval);
                } else {
                    setCount(Math.floor(current));
                }
            }, duration / steps);

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timeout);
    }, [numericValue, delay]);

    if (numericValue === 0) {
        // No number to animate, just show the value
        return <span style={{ color }}>{value}</span>;
    }

    return (
        <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            style={{ color }}
        >
            {prefix}
            {count.toLocaleString()}
            {suffix}
        </motion.span>
    );
}
