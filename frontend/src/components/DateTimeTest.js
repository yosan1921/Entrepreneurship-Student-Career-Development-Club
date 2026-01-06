import React, { useState } from 'react';

const DateTimeTest = () => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [result, setResult] = useState('');

    const testDateTime = () => {
        try {
            console.log('Input date:', date);
            console.log('Input time:', time);

            // Method 1: Direct string concatenation (problematic)
            const method1 = new Date(`${date}T${time}:00`);
            console.log('Method 1 (string concat):', method1);

            // Method 2: Parse components (recommended)
            const [year, month, day] = date.split('-').map(Number);
            const [hours, minutes] = time.split(':').map(Number);
            const method2 = new Date(year, month - 1, day, hours, minutes);
            console.log('Method 2 (parse components):', method2);

            // Current time
            const now = new Date();
            console.log('Current time:', now);

            // Comparisons
            const isPast1 = method1 < now;
            const isPast2 = method2 < now;

            setResult(`
Method 1: ${method1.toString()} - Is Past: ${isPast1}
Method 2: ${method2.toString()} - Is Past: ${isPast2}
Current: ${now.toString()}
            `);

        } catch (error) {
            setResult(`Error: ${error.message}`);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
            <h3>DateTime Test Component</h3>
            <div>
                <label>Date: </label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>
            <div>
                <label>Time: </label>
                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />
            </div>
            <button onClick={testDateTime}>Test DateTime</button>
            <pre style={{ background: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
                {result}
            </pre>
        </div>
    );
};

export default DateTimeTest;