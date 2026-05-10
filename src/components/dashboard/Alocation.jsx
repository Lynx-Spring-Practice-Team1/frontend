import React, { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const CardWrapper = ({ title, children }) => (
  <div className="bg-[#f0f0f0] dark:bg-[#252525] border border-gray-400 dark:border-gray-700 rounded-xl p-4 sm:p-5 flex-1 transition-colors">
    <h3 className="italic font-bold mb-3 text-sm sm:text-base text-gray-900 dark:text-white">{title}</h3>
    {children}
  </div>
);

const allocationData = [
  { name: 'Tech', value: 60, color: '#e07a5f' },
  { name: 'Energy', value: 25, color: '#3d405b' },
  { name: 'Cash', value: 15, color: '#81b29a' },
];

// Memoized Allocation component — only renders once, doesn't depend on price updates
const AllocationCard = React.memo(() => (
  <CardWrapper title="Allocation">
    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
      <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={allocationData}
              innerRadius={12}
              outerRadius={35}
              paddingAngle={0}
              dataKey="value"
              stroke="currentColor"
            >
              {allocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs sm:text-sm space-y-1.5">
        {allocationData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: item.color }} />
            <span className="dark:text-gray-300">{item.name} {item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  </CardWrapper>
));
export default AllocationCard;