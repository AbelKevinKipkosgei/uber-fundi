export function serializeProvider<T extends { rating: unknown }>(provider: T) {
  return {
    ...provider,
    rating: provider.rating != null ? Number(provider.rating) : null,
  };
}

export function serializeProviders<T extends { rating: unknown }>(
  providers: T[],
) {
  return providers.map(serializeProvider);
}
