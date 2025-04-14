import {
  Dialog,
  DialogContent,
  DialogClose
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

export function VideoModal({ isOpen, onClose, videoId }: VideoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden rounded-xl border-0">
        <DialogClose className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-50">
          <X className="w-6 h-6" />
        </DialogClose>
        
        {/* Video container with 16:9 aspect ratio */}
        <div className="relative pt-[56.25%]">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}