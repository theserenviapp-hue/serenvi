import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  totalSales: number;
  rank: string;
}

const Team: React.FC = () => {
  const [downline, setDownline] = useState<TeamMember[]>([]);
  const [upline, setUpline] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const distributorId = localStorage.getItem('distributorId') || '';
        const [downlineRes, uplineRes] = await Promise.all([
          api.get(`/distributors/${distributorId}/downline`),
          api.get(`/distributors/${distributorId}/upline`),
        ]);
        setDownline(downlineRes.data || []);
        setUpline(uplineRes.data || []);
      } catch (error) {
        console.error('Failed to fetch team', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  if (loading) return <div className="text-center py-12">Loading team...</div>;

  const TeamSection: React.FC<{
    title: string;
    members: TeamMember[];
    icon: string;
  }> = ({ title, members, icon }) => (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">{icon} {title}</h2>
      {members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex justify-between items-center pb-3 border-b">
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-gray-600 text-sm">{member.email}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">{member.rank}</p>
                <p className="text-gray-600 text-sm">₹{member.totalSales}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No members yet</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Network</h1>

      <TeamSection title="My Upline" members={upline} icon="⬆️" />
      <TeamSection title="My Downline" members={downline} icon="⬇️" />
    </div>
  );
};

export default Team;
