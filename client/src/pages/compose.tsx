import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import PostComposer from "@/components/modals/post-composer";
import { useState } from "react";

export default function Compose() {
  const [isComposerOpen, setIsComposerOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Compose" 
          subtitle="Create and schedule your social media content" 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* This will be replaced by the modal */}
        </main>
      </div>

      <PostComposer 
        isOpen={isComposerOpen} 
        onClose={() => {
          setIsComposerOpen(false);
          // Navigate back to dashboard when closed
          window.history.back();
        }} 
      />
    </div>
  );
}
