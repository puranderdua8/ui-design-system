import {
  Heading,
  Sidebar,
  Split,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@puranderdua/ui";

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="ds-border rounded-ds-card border-ds-border p-ds-gap-md">
    {children}
  </div>
);

/**
 * Every component the other four pages do not use (a unit test keeps this true):
 * tabs, a side column and a two-column split.
 */
export const AllComponentsPage = () => (
  <Stack gap="lg">
    <Heading as="h3" variant="h2">
      All components
    </Heading>
    <Stack gap="sm">
      <Heading as="h4" variant="h3">
        Tabs
      </Heading>
      <Tabs defaultValue="one" className="w-full">
        <TabsList aria-label="Sample tabs">
          <TabsTrigger value="one">First</TabsTrigger>
          <TabsTrigger value="two">Second</TabsTrigger>
          <TabsTrigger value="three" disabled>
            Locked
          </TabsTrigger>
        </TabsList>
        <TabsContent value="one">
          <Text>The first tab is open.</Text>
        </TabsContent>
        <TabsContent value="two">
          <Text>The second tab is open.</Text>
        </TabsContent>
      </Tabs>
    </Stack>
    <Stack gap="sm">
      <Heading as="h4" variant="h3">
        A side column
      </Heading>
      <Sidebar
        sidebarAs="div"
        sidebar={
          <Box>
            <Text>Side column</Text>
          </Box>
        }
      >
        <Box>
          <Text>
            The main column takes the rest of the room. When it gets narrow, the
            side column moves above it.
          </Text>
        </Box>
      </Sidebar>
    </Stack>
    <Stack gap="sm">
      <Heading as="h4" variant="h3">
        Two columns
      </Heading>
      <Split ratio="1:1" gap="md">
        <Box>
          <Text>Left</Text>
        </Box>
        <Box>
          <Text>Right</Text>
        </Box>
      </Split>
    </Stack>
  </Stack>
);
