import { Card, CardContent } from "@/components/ui/card";

export default function ContentLibrary() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <i className="fas fa-folder text-4xl text-gray-400 mb-4"></i>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Content Library
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Content library management coming soon. Store and organize your media files and templates here.
        </p>
      </CardContent>
    </Card>
  );
}
