import { describe, it, expect, beforeEach } from 'vitest';
import { useVoiceStore } from '../voice.store';

describe('useVoiceStore', () => {
  beforeEach(() => {
    useVoiceStore.setState({ speakingUserIds: new Set() });
  });

  describe('setSpeakingUserIds', () => {
    it('replaces the set of speaking user IDs', () => {
      useVoiceStore.getState().setSpeakingUserIds(new Set(['user-1', 'user-2']));
      expect(useVoiceStore.getState().speakingUserIds).toEqual(new Set(['user-1', 'user-2']));
    });

    it('replaces with an empty set', () => {
      useVoiceStore.getState().setSpeakingUserIds(new Set(['user-1']));
      useVoiceStore.getState().setSpeakingUserIds(new Set());
      expect(useVoiceStore.getState().speakingUserIds.size).toBe(0);
    });

    it('reflects the latest update immediately', () => {
      useVoiceStore.getState().setSpeakingUserIds(new Set(['user-1']));
      useVoiceStore.getState().setSpeakingUserIds(new Set(['user-2']));
      expect(useVoiceStore.getState().speakingUserIds.has('user-1')).toBe(false);
      expect(useVoiceStore.getState().speakingUserIds.has('user-2')).toBe(true);
    });
  });

  it('starts with an empty speakingUserIds set', () => {
    expect(useVoiceStore.getState().speakingUserIds.size).toBe(0);
  });
});
