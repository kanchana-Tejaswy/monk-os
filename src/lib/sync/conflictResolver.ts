export const conflictResolver = {
  /**
   * Resolves conflicts using Last-Write-Wins strategy.
   * Returns the data that should be kept.
   */
  resolve: (localData: Record<string, unknown> | null | undefined, remoteData: Record<string, unknown> | null | undefined) => {
    if (!remoteData) return localData;
    if (!localData) return remoteData;

    const localTime = new Date((localData.updated_at as string) || (localData.created_at as string) || 0).getTime();
    const remoteTime = new Date((remoteData.updated_at as string) || (remoteData.created_at as string) || 0).getTime();

    if (localTime >= remoteTime) {
      return localData;
    } else {
      return remoteData;
    }
  }
};
