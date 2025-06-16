import PostComposer from "@/components/modals/post-composer";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Compose() {
  const [isComposerOpen, setIsComposerOpen] = useState(true);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-96">
      <PostComposer 
        isOpen={isComposerOpen} 
        onClose={() => {
          setIsComposerOpen(false);
          setLocation("/");
        }} 
      />
    </div>
  );
}
