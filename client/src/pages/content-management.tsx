import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoriesManager from "@/components/categories-manager";
import MediaLibraryComponent from "@/components/media-library";

export default function ContentManagement() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Content Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            Organize your content with categories and manage your media library.
          </p>
        </div>

        <Tabs defaultValue="categories" className="space-y-4 sm:space-y-6">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="media">Media Library</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <CategoriesManager />
          </TabsContent>

          <TabsContent value="media">
            <MediaLibraryComponent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}