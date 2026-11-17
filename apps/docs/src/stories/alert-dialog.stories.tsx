import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@puranderdua/ui";

const meta = {
  title: "Components/AlertDialog",
  component: AlertDialog,
  parameters: {
    docs: {
      description: {
        component:
          "**Usage.** A dialog that asks for a decision before something is changed or lost. Give it a title, a description and two buttons that say what happens. Every string is yours to set.\n\n**Accessibility.** Focus moves to Cancel on open, is trapped inside, and returns to the trigger on close. Escape or Cancel closes it; a click on the scrim does not. It portals to `document.body` and re-applies the nearest `ThemeScope` (theme, vars, direction); a `container` prop wins.",
      },
    },
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="secondary">Reset my design</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start again?</AlertDialogTitle>
          <AlertDialogDescription>
            Your colours, fonts and shapes go back to where you began. This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep my design</AlertDialogCancel>
          <AlertDialogAction>Start again</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
