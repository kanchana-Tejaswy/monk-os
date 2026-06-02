export const conflictResolver = {
  /**
   * Resolves conflicts using Last-Write-Wins strategy.
   * Returns the data that should be kept.
   */
  resolve: (localData: any, remoteData: any) => {
    if (!remoteData) return localData;
    if (!localData) return remoteData;

    const localTime = new Date(localData.updated_at || localData.created_at || 0).getTime();
    const remoteTime = new Date(remoteData.updated_at || remoteData.created_at || 0).getTime();

    if (localTime >= remoteTime) {
      return localData;
    } else {
      return remoteData;
    }
  }
};
