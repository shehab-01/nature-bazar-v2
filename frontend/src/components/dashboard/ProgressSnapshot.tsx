import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ProgressSnapshot() {
  const weightData = [
    { week: 'Week 1', weight: 75, id: 'w1' },
    { week: 'Week 2', weight: 74.2, id: 'w2' },
    { week: 'Week 3', weight: 73.5, id: 'w3' },
    { week: 'Week 4', weight: 72.8, id: 'w4' },
  ];

  const stats = [
    { label: 'Current Weight', value: '72.8 kg', id: 'current' },
    { label: 'Starting Weight', value: '75.0 kg', id: 'starting' },
    { label: 'Goal Weight', value: '68.0 kg', id: 'goal' },
  ];

  return (
    <div 
      className="bg-white rounded p-6 mb-6 border"
      style={{ 
        borderColor: 'rgba(113, 113, 122, 0.2)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        borderRadius: '8px'
      }}
    >
      <h3 
        className="text-xl mb-6"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--nutritrack-text)' }}
      >
        Progress Snapshot
      </h3>

      {/* Chart */}
      <div className="mb-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weightData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(113, 113, 122, 0.2)" vertical={false} />
            <XAxis 
              dataKey="week" 
              tick={{ fill: '#71717A', fontFamily: 'var(--font-sans)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(113, 113, 122, 0.2)' }}
            />
            <YAxis 
              domain={[70, 76]}
              tick={{ fill: '#71717A', fontFamily: 'var(--font-sans)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(113, 113, 122, 0.2)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid rgba(113, 113, 122, 0.2)',
                borderRadius: '4px',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#C2410C" 
              strokeWidth={2}
              dot={{ fill: '#C2410C', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.id}
            className="p-4 rounded text-center"
            style={{ backgroundColor: 'rgba(113, 113, 122, 0.05)' }}
          >
            <div 
              className="text-2xl mb-1"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--nutritrack-text)' }}
            >
              {stat.value}
            </div>
            <div 
              className="text-xs"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--nutritrack-neutral)' }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}