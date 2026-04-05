import { describe, it, expect, beforeEach } from 'vitest';
import { useScreenShareStore } from '../screen-share.store';

const mockStream = {} as MediaStream;

describe('useScreenShareStore', () => {
  beforeEach(() => {
    useScreenShareStore.getState().clearStream();
    useScreenShareStore.getState().setMinimized(false);
  });

  it('starts with null stream and default flags', () => {
    const { stream, sharerName, isLocal, isMinimized } = useScreenShareStore.getState();
    expect(stream).toBeNull();
    expect(sharerName).toBeNull();
    expect(isLocal).toBe(false);
    expect(isMinimized).toBe(false);
  });

  describe('setStream', () => {
    it('stores stream, sharerName, and isLocal; resets isMinimized', () => {
      useScreenShareStore.getState().setMinimized(true);
      useScreenShareStore.getState().setStream(mockStream, 'alice', true);

      const { stream, sharerName, isLocal, isMinimized } = useScreenShareStore.getState();
      expect(stream).toBe(mockStream);
      expect(sharerName).toBe('alice');
      expect(isLocal).toBe(true);
      expect(isMinimized).toBe(false);
    });

    it('marks remote shares with isLocal=false', () => {
      useScreenShareStore.getState().setStream(mockStream, 'bob', false);
      expect(useScreenShareStore.getState().isLocal).toBe(false);
    });
  });

  describe('clearStream', () => {
    it('resets all fields to defaults', () => {
      useScreenShareStore.getState().setStream(mockStream, 'alice', true);
      useScreenShareStore.getState().setMinimized(true);
      useScreenShareStore.getState().clearStream();

      const { stream, sharerName, isLocal, isMinimized } = useScreenShareStore.getState();
      expect(stream).toBeNull();
      expect(sharerName).toBeNull();
      expect(isLocal).toBe(false);
      expect(isMinimized).toBe(false);
    });
  });

  describe('setMinimized', () => {
    it('toggles isMinimized', () => {
      useScreenShareStore.getState().setMinimized(true);
      expect(useScreenShareStore.getState().isMinimized).toBe(true);

      useScreenShareStore.getState().setMinimized(false);
      expect(useScreenShareStore.getState().isMinimized).toBe(false);
    });
  });
});
