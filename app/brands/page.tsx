import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/utils";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function BrandsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // TODO: Fetch brands from API
  const brands = [];

  return (
    <AppLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Brands</h1>
            <Link href="/brands/new">
              <Button>Create Brand</Button>
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {brands.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No brands</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new brand.
                    </p>
                    <div className="mt-6">
                      <Link href="/brands/new">
                        <Button>
                          <svg
                            className="-ml-1 mr-2 h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          New Brand
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {brands.map((brand: any) => (
                  <Card key={brand.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{brand.name}</CardTitle>
                        {brand.isDefault && <Badge variant="secondary">Default</Badge>}
                      </div>
                      <CardDescription>@{brand.slug}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {brand.description || "No description"}
                      </p>
                      <div className="flex gap-2">
                        <Link href={`/brands/${brand.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            View
                          </Button>
                        </Link>
                        <Link href={`/brands/${brand.id}/edit`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
