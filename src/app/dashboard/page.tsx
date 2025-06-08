import React from "react";

import { Activity, Users, DollarSign, Scissors } from "lucide-react";

const DashboardPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <h3 className="text-2xl font-bold">245</h3>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-4">
            <Scissors className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Services</p>
              <h3 className="text-2xl font-bold">12</h3>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-4">
            <Activity className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Appointments</p>
              <h3 className="text-2xl font-bold">28</h3>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-4">
            <DollarSign className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <h3 className="text-2xl font-bold">$2,415</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Add your recent activity items here */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-sm">John Doe - Haircut - 2:30 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <p className="text-sm">Jane Smith - Styling - 3:45 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <p className="text-sm">Mike Johnson - Beard Trim - 4:15 PM</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Add your recent activity items here */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-sm">John Doe - Haircut - 2:30 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <p className="text-sm">Jane Smith - Styling - 3:45 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <p className="text-sm">Mike Johnson - Beard Trim - 4:15 PM</p>
            </div>
          </div>
        </div>{" "}
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Add your recent activity items here */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-sm">John Doe - Haircut - 2:30 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <p className="text-sm">Jane Smith - Styling - 3:45 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <p className="text-sm">Mike Johnson - Beard Trim - 4:15 PM</p>
            </div>
          </div>
        </div>{" "}
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Add your recent activity items here */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-sm">John Doe - Haircut - 2:30 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <p className="text-sm">Jane Smith - Styling - 3:45 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <p className="text-sm">Mike Johnson - Beard Trim - 4:15 PM</p>
            </div>
          </div>
        </div>{" "}
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Add your recent activity items here */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-sm">John Doe - Haircut - 2:30 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <p className="text-sm">Jane Smith - Styling - 3:45 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <p className="text-sm">Mike Johnson - Beard Trim - 4:15 PM</p>
            </div>
          </div>
        </div>{" "}
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Add your recent activity items here */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-sm">John Doe - Haircut - 2:30 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <p className="text-sm">Jane Smith - Styling - 3:45 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <p className="text-sm">Mike Johnson - Beard Trim - 4:15 PM</p>
            </div>
          </div>
        </div>{" "}
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Add your recent activity items here */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-sm">John Doe - Haircut - 2:30 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <p className="text-sm">Jane Smith - Styling - 3:45 PM</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <p className="text-sm">Mike Johnson - Beard Trim - 4:15 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
