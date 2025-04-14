import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface OnboardingTourProps {
  isFirstTime: boolean;
  onComplete: () => void;
}

interface Step {
  title: string;
  description: React.ReactNode;
  targetClass: string;
}

export function OnboardingTour({ isFirstTime, onComplete }: OnboardingTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = useMemo<Step[]>(() => [
    {
      title: "Start with a Template",
      description: (
        <div className="flex flex-col gap-2">
          <p>Click <Button size="sm" className="px-2 py-1 text-xs h-auto">Use Template</Button> to import one of our pre-made recipes into your collection.</p>
        </div>
      ),
      targetClass: "recipe-templates"
    },
    {
      title: "Voice Start",
      description: (
        <div className="flex flex-col gap-2 items-center">
          <p>Click the microphone to START speaking.</p>
          <Button size="icon" className="w-12 h-12 mt-2 rounded-full bg-primary hover:bg-primary/90 shadow-lg">
            <span className="text-xl text-white">🎤</span>
          </Button>
        </div>
      ),
      targetClass: "ai-assistant-button"
    },
    {
      title: "Voice Stop",
      description: (
        <div className="flex flex-col gap-2 items-center">
          <p>Click the red button to STOP voice interaction.</p>
          <Button size="icon" variant="destructive" className="w-12 h-12 mt-2 rounded-full shadow-lg">
            <span className="text-xl text-white">⏹</span>
          </Button>
        </div>
      ),
      targetClass: "ai-assistant-button"
    },
    {
      title: "Add Your Own Recipe",
      description: (
        <div className="flex flex-col gap-2 items-center">
          <p>Click the button below to add your own recipe:</p>
          <Button className="w-48 mt-2 sm:w-auto">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Recipe</span>
          </Button>
        </div>
      ),
      targetClass: "add-recipe-button"
    }
  ], []);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      
      if (!user) {
        console.error('No user found');
        return;
      }

      // Check if user has completed onboarding
      const { data, error } = await supabase
        .from('user_preferences')
        .select('has_completed_onboarding')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Failed to fetch onboarding status:', error);
        return;
      }

      // Only show onboarding if it's first time and hasn't been completed
      if (isFirstTime && (!data || !data.has_completed_onboarding)) {
        setIsOpen(true);
      }
    };

    checkOnboardingStatus();
  }, [isFirstTime]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      highlightElement(steps[currentStep + 1].targetClass);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      highlightElement(steps[currentStep - 1].targetClass);
    }
  };

  const handleComplete = async () => {
    setIsOpen(false);
    
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      console.error('No user found');
      return;
    }

    // Upsert user preferences
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        has_completed_onboarding: true
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Failed to update onboarding status:', error);
    }
    
    onComplete();
  };

  // Keep track of highlighted element
  const highlightElement = (className: string) => {
    const element = document.querySelector(`.${className}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-4', 'ring-primary', 'ring-opacity-50', 'transition-all', 'duration-500');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-primary', 'ring-opacity-50');
      }, 2000);
    }
  };

  useEffect(() => {
    if (isOpen) {
      highlightElement(steps[currentStep].targetClass);
    }
  }, [currentStep, isOpen, steps]);

  const handleClose = () => {
    // We're not allowing direct closing without completion
    // This could be modified if needed
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="min-h-[250px] sm:max-w-[400px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
        </DialogHeader>
        
        <div className="min-h-[120px]">
          <DialogDescription asChild>
            <div className="text-muted-foreground">
              {steps[currentStep].description}
            </div>
          </DialogDescription>
        </div>
        
        <Separator />
        
        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className={currentStep === 0 ? 'invisible' : ''}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {steps.length}
            </span>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}