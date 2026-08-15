import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Thermometer, AlertTriangle, MapPin, Zap } from 'lucide-react';

// Mock Data for the Dashboard
const kpiData = {
  temp: 112,
  risk: 'Extreme',
  resolution: '10 mi²',
  credits: 999999
};

const hourlyData = [
  { time: '6AM', temp: 85 }, { time: '8AM', temp: 92 }, { time: '10AM', temp: 101 },
  { time: '12PM', temp: 108 }, { time: '2PM', temp: 112 }, { time: '4PM', temp: 110 },
  { time: '6PM', temp: 104 }, { time: '8PM', temp: 96 }, { time: '10PM', temp: 89 }
];

const riskData = [
  { name: 'Extreme', value: 40, color: '#EF4444' },
  { name: 'High', value: 30, color: '#F97316' },
  { name: 'Moderate', value: 20, color: '#EAB308' },
  { name: 'Safe', value: 10, color: '#22C55E' }
];

const weeklyData = [
  { day: 'Mon', temp: 105 }, { day: 'Tue', temp: 108 }, { day: 'Wed', temp: 110 },
  { day: 'Thu', temp: 112 }, { day: 'Fri', temp: 111 }, { day: 'Sat', temp: 109 }, { day: 'Sun', temp: 106 }
];

const zones = ['Downtown', 'Industrial', 'Residential', 'Parks'];

export default function AreaDashboard() {
  const [selectedZone, setSelectedZone] = useState('Downtown');

  return (
    <div className="flex-1 flex flex-col space-y-6">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Area Intelligence Dashboard</h2>
          <select 
            className="bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-2 outline-none focus:border-orange-500"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
          >
            {zones.map(zone => <option key={zone} value={zone}>{zone}</option>)}
          </select>
        </div>
        <p className="text-gray-400 mt-1">Real-time hyperlocal temperature intelligence for {selectedZone}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard icon={<Thermometer className="text-red-500" />} label="Current Temp" value={`${kpiData.temp}°F`} color="text-red-500" />
        <KPICard icon={<AlertTriangle className="text-orange-500" />} label="Risk Level" value={kpiData.risk} color="text-orange-500" />
        <KPICard icon={<MapPin className="text-blue-500" />} label="Resolution" value={kpiData.resolution} color="text-blue-500" />
        <KPICard icon={<Zap className="text-green-500" />} label="API Credits" value={kpiData.credits.toLocaleString()} color="text-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">24-Hour Temperature Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
              <Bar dataKey="temp" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Zone Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">7-Day Heat Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="temp" stroke="#EF4444" strokeWidth={3} dot={{ r: 5, fill: '#EF4444' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">{label}</span>
        <div className="p-2 bg-gray-900 rounded-lg">{icon}</div>
      </div>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}
