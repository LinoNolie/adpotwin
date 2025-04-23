import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analytics } from '../utils/analytics';

const TUTORIAL_STEPS = {
  HOME: [
    {
      id: 'home_welcome',
      screen: 'Home',
      target: 'welcome_banner',
      title: 'Welcome!',
      content: 'Learn how to play and win big!',
    },
    {
      id: 'home_active_pots',
      screen: 'Home',
      target: 'active_pots',
      title: 'Active Pots',
      content: 'Join these active games to start playing.',
    }
  ],
  GAME: [
    {
      id: 'game_bet',
      screen: 'Games',
      target: 'bet_input',
      title: 'Place Your Bet',
      content: 'Enter the amount you want to bet.',
    },
    {
      id: 'game_multiplier',
      screen: 'Games',
      target: 'multiplier',
      title: 'Watch the Multiplier',
      content: 'Cash out before the game crashes!',
    },
    {
      id: 'game_cashout',
      screen: 'Games',
      target: 'cashout_button',
      title: 'Cash Out',
      content: 'Click to secure your winnings.',
    }
  ]
};

export function useTutorial(screen) {
  const [currentStep, setCurrentStep] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  useEffect(() => {
    loadCompletedSteps();
  }, []);

  const loadCompletedSteps = async () => {
    try {
      const saved = await AsyncStorage.getItem('tutorial_completed_steps');
      if (saved) {
        setCompletedSteps(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Error loading tutorial state:', error);
    }
  };

  const markStepComplete = useCallback(async (stepId) => {
    try {
      const newCompleted = new Set(completedSteps).add(stepId);
      setCompletedSteps(newCompleted);
      await AsyncStorage.setItem(
        'tutorial_completed_steps',
        JSON.stringify([...newCompleted])
      );

      analytics.trackEvent('tutorial_step_completed', {
        stepId,
        screen,
      });
    } catch (error) {
      console.error('Error saving tutorial progress:', error);
    }
  }, [completedSteps, screen]);

  const startTutorial = useCallback(() => {
    const steps = TUTORIAL_STEPS[screen] || [];
    const nextStep = steps.find(step => !completedSteps.has(step.id));
    
    if (nextStep) {
      setCurrentStep(nextStep);
      setIsVisible(true);
      
      analytics.trackEvent('tutorial_started', {
        screen,
        stepId: nextStep.id,
      });
    }
  }, [screen, completedSteps]);

  const handleNext = useCallback(() => {
    if (!currentStep) return;

    markStepComplete(currentStep.id);
    
    const steps = TUTORIAL_STEPS[screen] || [];
    const currentIndex = steps.findIndex(step => step.id === currentStep.id);
    const nextStep = steps[currentIndex + 1];

    if (nextStep && !completedSteps.has(nextStep.id)) {
      setCurrentStep(nextStep);
    } else {
      setIsVisible(false);
      setCurrentStep(null);
      
      analytics.trackEvent('tutorial_completed', {
        screen,
      });
    }
  }, [currentStep, screen, completedSteps, markStepComplete]);

  const resetTutorial = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('tutorial_completed_steps');
      setCompletedSteps(new Set());
      setCurrentStep(null);
      setIsVisible(false);

      analytics.trackEvent('tutorial_reset', {
        screen,
      });
    } catch (error) {
      console.error('Error resetting tutorial:', error);
    }
  }, [screen]);

  return {
    currentStep,
    isVisible,
    startTutorial,
    handleNext,
    resetTutorial,
    isCompleted: TUTORIAL_STEPS[screen]?.every(
      step => completedSteps.has(step.id)
    ) || false,
  };
}