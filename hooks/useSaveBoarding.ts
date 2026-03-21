import { useState } from 'react';
import { Alert } from 'react-native';
import { useBoardingStore } from '@/store/boarding.store';
import { saveBoarding, unsaveBoarding } from '@/lib/saved-boarding';

export function useSaveBoarding(boardingId: string) {
  const { isSaved, toggleSaved } = useBoardingStore();
  const [isSaving, setIsSaving] = useState(false);
  const saved = isSaved(boardingId);

  const toggleSave = async () => {
    if (isSaving) return;
    // Capture current state before the optimistic update
    const wasSaved = isSaved(boardingId);
    // Optimistic update
    toggleSaved(boardingId);
    setIsSaving(true);
    try {
      if (wasSaved) {
        await unsaveBoarding(boardingId);
      } else {
        await saveBoarding(boardingId);
      }
    } catch {
      // Revert optimistic update on failure
      toggleSaved(boardingId);
      Alert.alert('Error', 'Failed to update saved boardings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return { saved, toggleSave, isSaving };
}
