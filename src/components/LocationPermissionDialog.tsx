
import React, { useState } from 'react';
import { MapPin, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LocationPermissionDialogProps {
  isOpen: boolean;
  onRequestPermission: () => Promise<boolean>;
  onSkip: () => void;
}

const LocationPermissionDialog: React.FC<LocationPermissionDialogProps> = ({
  isOpen,
  onRequestPermission,
  onSkip,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    setError(null);
    
    try {
      const granted = await onRequestPermission();
      if (!granted) {
        setError('Location permission was denied. You can still search for cities manually.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location permission');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Enable Location Access
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              We'd like to access your location to provide accurate weather information for your area.
            </p>
            
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Your privacy is protected</p>
                <p className="text-blue-700">Location data is only used to fetch weather information and is not stored or shared.</p>
              </div>
            </div>

            {!window.isSecureContext && location.hostname !== 'localhost' && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900">HTTPS Required</p>
                  <p className="text-amber-700">For security reasons, location access requires HTTPS in production environments.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-900">Permission Error</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-2 pt-4">
          <Button 
            onClick={handleRequestPermission} 
            disabled={isRequesting}
            className="w-full"
          >
            {isRequesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Requesting Permission...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Allow Location Access
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onSkip}
            className="w-full"
          >
            Skip and Search Manually
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPermissionDialog;
