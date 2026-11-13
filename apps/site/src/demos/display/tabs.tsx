import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@puranderdua/ui";

export const Demo = () => (
  <Tabs defaultValue="tokens" className="w-full">
    <TabsList aria-label="Design system tiers">
      <TabsTrigger value="tokens">Tokens</TabsTrigger>
      <TabsTrigger value="styles">Styles</TabsTrigger>
      <TabsTrigger value="components">Components</TabsTrigger>
      <TabsTrigger value="legacy" disabled>
        Legacy
      </TabsTrigger>
    </TabsList>
    <TabsContent value="tokens">
      <Text>Primitives and semantic roles, written as DTCG JSON.</Text>
    </TabsContent>
    <TabsContent value="styles">
      <Text>A Tailwind v4 bridge and recipes in one stylesheet.</Text>
    </TabsContent>
    <TabsContent value="components">
      <Text>React components that use semantic tokens only.</Text>
    </TabsContent>
  </Tabs>
);
