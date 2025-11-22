import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Alchemy!
            </h1>
            <p className="text-gray-600 mb-2">
              You're logged in as: <strong>{user.email}</strong>
            </p>
            {user.user_metadata?.name && (
              <p className="text-gray-600 mb-4">
                Name: <strong>{user.user_metadata.name}</strong>
              </p>
            )}
            <div className="mt-6">
              <a
                href="/auth/logout"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign out
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
