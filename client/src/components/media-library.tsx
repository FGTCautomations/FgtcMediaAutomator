import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import type { MediaLibrary } from "@shared/schema";

export default function MediaLibraryComponent() {
  const [selectedFiles, setSelectedFiles] = useState<MediaLibrary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");
  const [previewMedia, setPreviewMedia] = useState<MediaLibrary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: mediaFiles = [], isLoading } = useQuery<MediaLibrary[]>({
    queryKey: ["/api/media-library"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch("/api/media-library/upload", {
        method: "POST",
        body: formData,
        credentials: 'include', // Include auth cookies
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-library"] });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/media-library/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-library"] });
    },
  });

  const updateTagsMutation = useMutation({
    mutationFn: async ({ id, tags }: { id: number; tags: string[] }) => {
      return apiRequest("PATCH", `/api/media-library/${id}`, { tags });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-library"] });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      uploadMutation.mutate(file);
    });
  };

  const filteredFiles = mediaFiles.filter((file) => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === "all" || 
                       (filterType === "image" && file.mimeType.startsWith("image/")) ||
                       (filterType === "video" && file.mimeType.startsWith("video/"));
    
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (file: MediaLibrary) => {
    setSelectedFiles(prev => 
      prev.find(f => f.id === file.id) 
        ? prev.filter(f => f.id !== file.id)
        : [...prev, file]
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Media Library</h2>
        <div className="flex items-center">
          <Button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
            <i className="fas fa-upload mr-2"></i>
            Upload Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search files or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
          {["all", "image", "video"].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type as any)}
              className="whitespace-nowrap flex-shrink-0"
            >
              <span className="hidden sm:inline">{type === "all" ? "All Files" : `${type.charAt(0).toUpperCase() + type.slice(1)}s`}</span>
              <span className="sm:hidden">{type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Selected Files Actions */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete these files?")) {
                      selectedFiles.forEach(file => deleteMutation.mutate(file.id));
                      setSelectedFiles([]);
                    }
                  }}
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-2">
                <div className="animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredFiles.map((file) => (
            <Card
              key={file.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedFiles.find(f => f.id === file.id) ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => handleFileSelect(file)}
            >
              <CardContent className="p-2">
                <div className="aspect-square mb-2 relative">
                  {file.mimeType.startsWith("image/") ? (
                    <img
                      src={file.url}
                      alt={file.alt || file.originalName}
                      className="w-full h-full object-cover rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewMedia(file);
                      }}
                    />
                  ) : file.mimeType.startsWith("video/") ? (
                    <video
                      src={file.url}
                      className="w-full h-full object-cover rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewMedia(file);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                      <i className="fas fa-file text-2xl text-gray-400"></i>
                    </div>
                  )}
                  
                  {/* File type badge */}
                  <Badge 
                    className="absolute top-1 right-1 text-xs"
                    variant={file.mimeType.startsWith("image/") ? "default" : "secondary"}
                  >
                    {file.mimeType.startsWith("image/") ? "IMG" : "VID"}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                  
                  {(file.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(file.tags || []).slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {(file.tags || []).length > 2 && (
                        <span className="text-xs text-gray-400">+{(file.tags || []).length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredFiles.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <i className="fas fa-images text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? "No files found" : "No media files yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? "Try adjusting your search or filter criteria."
                  : "Upload images and videos to use in your social media posts."
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => fileInputRef.current?.click()}>
                  <i className="fas fa-upload mr-2"></i>
                  Upload Your First File
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Preview Modal */}
      <Dialog open={!!previewMedia} onOpenChange={() => setPreviewMedia(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewMedia?.originalName}</DialogTitle>
          </DialogHeader>
          {previewMedia && (
            <div className="space-y-4">
              <div className="flex justify-center">
                {previewMedia.mimeType.startsWith("image/") ? (
                  <img
                    src={previewMedia.url}
                    alt={previewMedia.alt || previewMedia.originalName}
                    className="max-w-full max-h-96 object-contain"
                  />
                ) : (
                  <video
                    src={previewMedia.url}
                    controls
                    className="max-w-full max-h-96"
                  />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">File Size:</span> {formatFileSize(previewMedia.size)}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {previewMedia.mimeType}
                </div>
                <div>
                  <span className="font-medium">Uploaded:</span> {new Date(previewMedia.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Tags:</span> {(previewMedia.tags || []).join(", ") || "None"}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}