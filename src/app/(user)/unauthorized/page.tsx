// app/unauthorized/page.js
"use client";
import Link from "next/link";
import { ShieldX, Home, ArrowLeft } from "lucide-react";
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>

          <p className="text-gray-600 mb-2">
            You do not have permission to access this page.
          </p>

          <p className="text-sm text-gray-500 mb-8">
            Only users with{" "}
            <span className="font-semibold text-blue-600">Admin</span> or{" "}
            <span className="font-semibold text-green-600">Barber</span> roles
            can access this area.
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              If you believe this is an error, please contact your
              administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
