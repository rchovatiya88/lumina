import React, { useState } from 'react';
import { MOCK_PROJECTS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { Settings, LogOut, FileText, ShoppingCart, Layout, TrendingUp } from 'lucide-react';
import { DesignProject } from '../types';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'affiliate'>('overview');

  // Mock Data for Charts
  const earningsData = [
    { name: 'Services', value: 4000 },
    { name: 'Affiliate', value: 1200 },
  ];
  const COLORS = ['#44403c', '#d6d3d1'];
  
  const weeklyData = [
    { name: 'Mon', clicks: 20 },
    { name: 'Tue', clicks: 45 },
    { name: 'Wed', clicks: 30 },
    { name: 'Thu', clicks: 60 },
    { name: 'Fri', clicks: 55 },
    { name: 'Sat', clicks: 80 },
    { name: 'Sun', clicks: 40 },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 hidden md:block">
        <div className="p-6">
          <h2 className="text-stone-400 text-xs uppercase tracking-wider font-semibold mb-6">Designer Portal</h2>
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'overview' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:bg-stone-50'}`}
            >
              <Layout size={18} /> Overview
            </button>
            <button 
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'projects' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:bg-stone-50'}`}
            >
              <FileText size={18} /> Projects
            </button>
            <button 
              onClick={() => setActiveTab('affiliate')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'affiliate' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:bg-stone-50'}`}
            >
              <TrendingUp size={18} /> Affiliate Income
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-stone-500 hover:bg-stone-50 transition">
              <Settings size={18} /> Settings
            </button>
          </nav>
        </div>
        <div className="absolute bottom-0 w-64 p-6 border-t border-stone-100">
          <button className="flex items-center gap-3 text-stone-500 text-sm hover:text-stone-900 transition">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-serif text-stone-900">Welcome back, Erin</h1>
            <p className="text-stone-500 text-sm">Here's what's happening with your business today.</p>
          </div>
          <div className="flex gap-3">
             <button className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800">New Project</button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <p className="text-stone-500 text-xs uppercase mb-1">Total Revenue (Mo)</p>
                <p className="text-3xl font-serif text-stone-900">$5,200</p>
                <p className="text-green-600 text-xs mt-2 flex items-center gap-1">↑ 12% from last month</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <p className="text-stone-500 text-xs uppercase mb-1">Active Projects</p>
                <p className="text-3xl font-serif text-stone-900">8</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <p className="text-stone-500 text-xs uppercase mb-1">Affiliate Clicks</p>
                <p className="text-3xl font-serif text-stone-900">1,240</p>
                <p className="text-green-600 text-xs mt-2 flex items-center gap-1">↑ 5% from last week</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <p className="text-stone-500 text-xs uppercase mb-1">Pending Invoices</p>
                <p className="text-3xl font-serif text-stone-900">$850</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Projects */}
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                  <h3 className="font-serif text-lg">Active Projects</h3>
                  <button className="text-xs text-stone-500 hover:text-stone-900">View All</button>
                </div>
                <div>
                  {MOCK_PROJECTS.map((project) => (
                    <div key={project.id} className="p-4 border-b border-stone-50 last:border-0 flex items-center gap-4 hover:bg-stone-50 transition">
                      <img src={project.thumbnail} alt="" className="w-12 h-12 rounded-md object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-stone-900 text-sm">{project.clientName}</p>
                        <p className="text-xs text-stone-500">{project.roomType}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        project.status === 'Review' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{project.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
                <h3 className="font-serif text-lg mb-6">Revenue Split</h3>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={earningsData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {earningsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 text-sm text-stone-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-stone-700 rounded-full"></div> Services
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-stone-300 rounded-full"></div> Affiliate
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'affiliate' && (
           <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
             <h3 className="font-serif text-lg mb-6">Link Performance (This Week)</h3>
             <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={weeklyData}>
                   <XAxis dataKey="name" stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} />
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e7e5e4', borderRadius: '8px' }}
                      cursor={{fill: '#f5f5f4'}}
                   />
                   <Bar dataKey="clicks" fill="#44403c" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;