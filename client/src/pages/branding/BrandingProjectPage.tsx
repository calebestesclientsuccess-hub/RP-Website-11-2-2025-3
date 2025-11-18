const { data: scenes, isLoading: scenesLoading } = useQuery({
    queryKey: [`/api/branding/projects/${projectId}/scenes`, { hydrate: true }],
    queryFn: async () => {
      const response = await fetch(`/api/branding/projects/${projectId}/scenes?hydrate=true`);
      if (!response.ok) throw new Error('Failed to fetch scenes');
      return response.json();
    },
    enabled: !!projectId,
    staleTime: 0, // Always fetch fresh data with hydration
  });