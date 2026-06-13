import { useState } from "react";
import { Stack } from "expo-router";
import { publicTrpc, getPublicTRPCConfig } from "../../lib/public-trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function ModalLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [publicTrpcClient] = useState(() => publicTrpc.createClient(getPublicTRPCConfig()));

  return (
    <publicTrpc.Provider client={publicTrpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: true, presentation: "modal" }} />
      </QueryClientProvider>
    </publicTrpc.Provider>
  );
}
