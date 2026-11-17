/**
 * Every Guided string of the Builder, as data (spec 4.10, D-143).
 *
 * Rules: second person, short sentences, one idea per sentence, say what it does
 * before what it is called, no technical word (see `bannedWords` and the test in
 * `builder.test.ts`). Errors are a sentence plus a suggestion.
 *
 * Option names are DRAFTS from spec 4.4 and 4.10. The T0 usability round has not run
 * yet, so the vocabulary gate stays open until its findings are applied.
 *
 * Nothing here is read by a component yet (S44 writes only the data).
 */

/** Words that must never appear in a Guided string (spec 4.10). Studio may use them. */
export const bannedWords = [
  "token",
  "semantic",
  "primitive",
  "alias",
  "DTCG",
  "ramp",
  "chroma",
  "hue",
  "knob",
  "override",
  "resolver",
] as const;

/** The longest sentence allowed in a Guided string, in words. */
export const maxSentenceWords = 25;

type StepId =
  | "start"
  | "colour"
  | "typography"
  | "shape"
  | "spacing"
  | "depth"
  | "check"
  | "use";

type Choice = {
  /** Short name on the picture card. */
  name: string;
  /** One short sentence under the name. */
  hint: string;
};

type ChoiceGroup = {
  /** The label of the group of cards. */
  label: string;
  choices: Choice[];
};

type Step = {
  id: StepId;
  /** Name in the step list. */
  name: string;
  /** The plain question that opens the step. */
  question: string;
  /** What the decision is. */
  whatItIs: string;
  /** Where it shows up. */
  whereItShows: string;
  groups: ChoiceGroup[];
  /** Label of the optional extra controls. Absent when a step has none. */
  fineTune?: string;
  whyItMatters: string;
};

const steps: Step[] = [
  {
    id: "start",
    name: "Start",
    question: "How do you want to begin?",
    whatItIs:
      "A design system is a set of choices, such as colours, fonts and corners, that your whole product shares.",
    whereItShows:
      "Every button, form and page you make will follow these choices.",
    groups: [
      {
        label: "Starting look",
        choices: [
          {
            name: "Quiet and neutral",
            hint: "Calm greys that stay out of the way.",
          },
          {
            name: "Crisp and businesslike",
            hint: "Clean and sharp, for serious work.",
          },
          {
            name: "Warm and calm",
            hint: "Soft and friendly, close to nature.",
          },
          { name: "Bold and playful", hint: "Loud shapes and lively colour." },
        ],
      },
    ],
    fineTune: "Pick your brand colour",
    whyItMatters:
      "A starting look saves you time, and you can change every part of it later.",
  },
  {
    id: "colour",
    name: "Colour",
    question: "What are your colours?",
    whatItIs:
      "Your brand colour is the one people link to you. Your highlight colour draws the eye to what matters.",
    whereItShows:
      "Main buttons, links and badges use your brand colour. Small accents use your highlight colour.",
    groups: [
      {
        label: "Background feel",
        choices: [
          { name: "Cool", hint: "Greys with a hint of blue." },
          { name: "Neutral", hint: "Plain greys with no tint." },
          { name: "Warm", hint: "Greys with a hint of sand." },
          {
            name: "Tinted to brand",
            hint: "Greys that lean toward your colour.",
          },
        ],
      },
    ],
    fineTune: "Choose your own highlight colour",
    whyItMatters:
      "People need to read your text. We check every colour pair as you go.",
  },
  {
    id: "typography",
    name: "Typography",
    question: "How should words look?",
    whatItIs: "You pick one font for headings and one for body text.",
    whereItShows:
      "Every heading, paragraph, button and label uses these fonts.",
    groups: [
      {
        label: "Font pairing",
        choices: [
          {
            name: "Clean and modern",
            hint: "Simple shapes that are easy to read.",
          },
          {
            name: "Classic and warm",
            hint: "A touch of tradition for long reading.",
          },
          {
            name: "Friendly and round",
            hint: "Soft letters that feel welcoming.",
          },
        ],
      },
      {
        label: "Text size",
        choices: [
          { name: "Compact", hint: "Smaller text, more on the screen." },
          { name: "Standard", hint: "A good size for most people." },
          { name: "Large", hint: "Bigger text that is easier on the eyes." },
        ],
      },
    ],
    fineTune: "I have my own font",
    whyItMatters:
      "Fonts set the voice of your product before anyone reads a word.",
  },
  {
    id: "shape",
    name: "Shape",
    question: "Sharp or round?",
    whatItIs:
      "You choose how round the corners are and how thick the outlines are.",
    whereItShows:
      "Buttons, cards, fields and menus all share these corners and outlines.",
    groups: [
      {
        label: "Corners",
        choices: [
          { name: "Sharp", hint: "Square corners, precise and formal." },
          { name: "Soft", hint: "Slightly rounded, friendly but tidy." },
          { name: "Rounded", hint: "Clearly round, relaxed and open." },
          { name: "Extra round", hint: "Pill shapes, playful and bold." },
        ],
      },
      {
        label: "Outline",
        choices: [
          { name: "Thin", hint: "Light lines that fade back." },
          { name: "Bold", hint: "Thick lines that stand out." },
        ],
      },
    ],
    whyItMatters:
      "Shape gives your product its personality, even without colour.",
  },
  {
    id: "spacing",
    name: "Spacing",
    question: "How much room should things have?",
    whatItIs: "You choose how much empty space sits around and between things.",
    whereItShows: "Forms, lists, cards and whole pages get tighter or airier.",
    groups: [
      {
        label: "Spacing",
        choices: [
          { name: "Compact", hint: "Tight, to fit more on the screen." },
          { name: "Comfortable", hint: "A balanced amount of room." },
          { name: "Spacious", hint: "Plenty of air around everything." },
        ],
      },
    ],
    whyItMatters: "Buttons always stay easy to tap, whatever you pick.",
  },
  {
    id: "depth",
    name: "Depth and motion",
    question: "Flat or layered? Calm or lively?",
    whatItIs:
      "You choose how much shadow things have and how fast they move. This step is optional.",
    whereItShows:
      "Cards, menus and dialogs cast shadows. Hovering and opening things use movement.",
    groups: [
      {
        label: "Shadows",
        choices: [
          { name: "Flat", hint: "No shadows at all." },
          { name: "Crisp", hint: "Thin, sharp shadows." },
          { name: "Soft", hint: "Wide, gentle shadows." },
          { name: "Hard", hint: "Solid, bold shadows." },
        ],
      },
      {
        label: "Motion",
        choices: [
          { name: "Quick", hint: "Fast changes that feel snappy." },
          { name: "Standard", hint: "A natural pace." },
          { name: "Calm", hint: "Slow, smooth changes." },
          { name: "Bouncy", hint: "Lively movement with a little spring." },
        ],
      },
    ],
    whyItMatters:
      "Depth shows what sits on top, and motion shows what just changed.",
  },
  {
    id: "check",
    name: "Check",
    question: "Can everyone read and use it?",
    whatItIs:
      "We test every colour pair to see whether people can read the text on it.",
    whereItShows: "Text on buttons, banners, fields and cards.",
    groups: [],
    fineTune: "Technical details",
    whyItMatters:
      "Some people see colour differently or have low vision. Readable text helps everyone.",
  },
  {
    id: "use",
    name: "Use it",
    question: "Take it with you",
    whatItIs:
      "Share your system, print a style guide, or hand it to your designer or developer.",
    whereItShows: "In your link, your files and the style guide you print.",
    groups: [],
    whyItMatters:
      "A system only helps when the people who build your product can use it.",
  },
];

export const builderContent = {
  steps,

  /** Buttons say where they go. `{step}` is replaced with the next step's name. */
  buttons: {
    next: "Next: {step}",
    back: "Back: {step}",
    useIt: "Use it",
    tryAnother: "Try another combination",
    undo: "Undo",
    redo: "Redo",
    reset: "Start again",
    showMe: "Show me",
    fixIt: "Fix it for me",
    copyLink: "Copy link",
    saveCopy: "Save a copy",
    saveAsPdf: "Save as PDF",
    copy: "Copy",
    download: "Download",
    play: "Play",
    rename: "Rename",
    duplicate: "Duplicate",
    delete: "Delete",
    keepIt: "Keep it",
    cancel: "Cancel",
  },

  /** The status pill in the top bar. `{count}` is replaced with a number. */
  status: {
    readable: "Readable",
    fixOne: "1 thing to fix",
    fixMany: "{count} things to fix",
    saved: "Saved on this device",
    undone: "Undone",
    fixed: "Fixed. Your text is easier to read now.",
    allReadable: "All {count} combinations are readable (WCAG AA).",
    sharedView: "You are looking at someone else's design system.",
    snapshot:
      "This link is a snapshot. Make a new link after you change anything.",
  },

  /** What the Check step says about a cause. `{count}` places are affected. */
  check: {
    tooLight:
      "Your brand colour is too light for white text. {count} places are affected, for example main buttons.",
    tooDark:
      "Your brand colour is too dark for dark text. {count} places are affected, for example badges.",
    lowContrast:
      "Some text is hard to read on its background. {count} places are affected.",
    before: "Before",
    after: "After",
  },

  /** An error is one sentence, then a suggestion. */
  errors: {
    colourInvalid: {
      message: "That colour did not work.",
      fix: "Try a hex code such as #3366cc, or pick one from the wheel.",
    },
    fontMissing: {
      message: "We can not load that font in the preview.",
      fix: "We show a stand-in for now. Your font name still goes into your files.",
    },
    storageBlocked: {
      message: "Your browser is not letting us save your work.",
      fix: "Allow site data for this page, or download your project file to keep it.",
    },
    storageFull: {
      message: "There is no more room to save your work on this device.",
      fix: "Delete a project you do not need, or download your project file.",
    },
    linkBroken: {
      message: "This link did not open.",
      fix: "Ask the sender for a new link, or start a new design system.",
    },
    fileInvalid: {
      message: "That file is not a design system we can read.",
      fix: "Choose a project file that you downloaded from this tool.",
    },
    deleteProject: {
      message: "Delete this project?",
      fix: "You can not get it back, so download it first if you might need it.",
    },
  },
} as const;
