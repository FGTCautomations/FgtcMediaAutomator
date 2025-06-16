import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoriesManager from "@/components/categories-manager";
import MediaLibraryComponent from "@/components/media-library";

export default function ContentManagement() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
  );
}