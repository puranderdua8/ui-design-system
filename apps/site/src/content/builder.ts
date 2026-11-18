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

export type StepId =
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

  /**
   * "Not sure?" on the Start step: three questions that pick a starting look and a
   * few choices, with the reason as text (spec 4.4). The reason shown is the three
   * `reason` sentences of the chosen answers, one after another.
   */
  questions: {
    link: "Not sure? Answer three questions",
    result: "Here is why we chose this for you:",
    mood: {
      question: "What mood fits your product?",
      options: {
        calm: {
          name: "Calm and quiet",
          reason: "A calm mood suits the quiet and neutral look.",
        },
        serious: {
          name: "Serious and trusted",
          reason: "A serious mood suits the crisp and businesslike look.",
        },
        warm: {
          name: "Warm and friendly",
          reason: "A friendly mood suits the warm and calm look.",
        },
        bold: {
          name: "Bold and playful",
          reason: "A playful mood suits the bold and playful look.",
        },
      },
    },
    room: {
      question: "How much room do you like?",
      options: {
        tight: {
          name: "Tight",
          reason: "Things sit close together, so more fits on the screen.",
        },
        balanced: {
          name: "Balanced",
          reason: "Things have a comfortable amount of room around them.",
        },
        airy: {
          name: "Airy",
          reason: "Things have plenty of room, so each one stands out.",
        },
      },
    },
    corners: {
      question: "How do you like corners?",
      options: {
        sharp: {
          name: "Sharp",
          reason: "Square corners look precise and formal.",
        },
        soft: {
          name: "Soft",
          reason: "Slightly rounded corners feel neat and friendly.",
        },
        rounded: {
          name: "Rounded",
          reason: "Rounder corners feel gentle and welcoming.",
        },
        extraRound: {
          name: "Extra round",
          reason: "Very round corners feel bold and playful.",
        },
      },
    },
  },

  /** The Start and Colour steps' own controls (S53). */
  start: {
    brandLabel: "Brand colour",
    brandHint: "Optional. Type a code such as #3366cc, or pick a colour.",
    pickerLabel: "Pick a colour",
    fromImage: "Choose a colour from a picture",
    imageNote:
      "The picture stays on your device. It is never uploaded or saved.",
    imageFailed: {
      message: "We could not find a colour in that picture.",
      fix: "Try a different picture, or type a colour code.",
    },
    clearBrand: "Use the colour of the look",
    looksLabel: "Starting look",
    looksHint: "Each look shows your colour. You can change everything later.",
    thumbnailSample: "Sample button",
    applyAnswers: "Choose a look for me",
  },
  colour: {
    brandLabel: "Brand colour",
    shadesLabel: "Shades we made from your colour",
    highlightLabel: "Highlight colour",
    highlightHint: "Pick one of ours, or choose your own.",
    suggestionLabel: "Suggested highlight",
    ownHighlight: "Your own highlight colour",
    useLookHighlight: "Use the colour of the look",
    feelLabel: "Background feel",
    readable: "Text is easy to read on this colour.",
    hard: "Text is hard to read on this colour. The Check step can fix it.",
    readableBrand: "White text on this colour is easy to read.",
    hardBrand:
      "Text on this colour is hard to read. The Check step can fix it.",
  },
  /** The Typography step's own controls (S54). */
  typography: {
    pairingsHint: "Each card is drawn in its own fonts.",
    headingSample: "Make it yours",
    bodySample: "Words are how people hear your voice.",
    headingFont: "Heading font",
    bodyFont: "Body font",
    ownHint:
      "Optional. Type the name of a font you already use, such as Space Grotesk.",
    ownIntro:
      "Your own font appears here as a stand-in, because we never load fonts from other websites.",
    standIn: "Shown here in a stand-in font:",
    clearOwn: "Use the pairing instead",
    sizeFineTune: "Fine-tune the text size",
    sizeWord: {
      smaller: "Smaller than standard",
      standard: "Standard size",
      larger: "Larger than standard",
    },
  },
  /** The Shape, Spacing and Depth and motion steps' own controls (S55). */
  look: {
    cornersSample: "Sample",
    outlineSample: "Sample",
    cornersFineTune: "Fine-tune the corners",
    cornersWord: {
      squarer: "Squarer than the choice",
      same: "As in the choice",
      rounder: "Rounder than the choice",
    },
    outlineFineTune: "Fine-tune the outline thickness",
    outlineWord: "{count} pixels thick",
    spacingFineTune: "Fine-tune the spacing",
    spacingWord: {
      tighter: "Tighter than the choice",
      same: "As in the choice",
      roomier: "Roomier than the choice",
    },
    tapNote: "Buttons always stay easy to tap, even in the tightest spacing.",
    shadowSample: "Card",
    shadowFineTune: "Fine-tune the shadows",
    shadowWord: {
      lighter: "Lighter than the choice",
      same: "As in the choice",
      darker: "Darker than the choice",
    },
    motionFineTune: "Fine-tune the speed",
    motionWord: {
      slower: "Slower than the choice",
      same: "As in the choice",
      faster: "Faster than the choice",
    },
    playHint: "Press Play to see how things move.",
    playSample: "Moving sample",
    reducedMotion:
      "Your device asks for less movement, so the sample jumps instead of moving.",
  },

  /** "Try another combination" in the top bar (S55). */
  shuffle: {
    keepColours: "Keep my colours",
    done: "Here is another combination.",
  },

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

  /** The Builder's frame: top bar, step list, project chooser (S51). */
  shell: {
    name: "Builder",
    /** Page title of a step: `{step}`. The site adds its own name after it. */
    stepTitle: "{step} · Builder",
    projectsTitle: "Your design systems",
    studioTitle: "Studio",
    stepListLabel: "Steps",
    topBarLabel: "Your design system",
    previewLabel: "Preview of your design system",
    previewHeading: "Preview",
    skipToPreview: "Skip to the preview",
    skipToSteps: "Skip to the steps",
    projectName: "Name of your design system",
    viewLabel: "View",
    guided: "Guided",
    studio: "Studio",
    /** Shown in a step's row while its picture choices are not built yet. */
    yourChoice: "Your choice now",
    comingSoon: "The picture choices for this step are on their way.",
    /** The current value matches none of the picture choices. */
    sameAsLook: "As in your starting look",
    brandColour: "Brand colour",
    brandFromLook: "Brand colour: from your starting look",
    outlineThin: "Thin",
    outlineBold: "Bold",
    checkReadable: "Readable",
    useSummary: "Share, print or hand over",
    /** The chooser at the start of the Builder. */
    chooser: {
      lead: "Pick one to keep working on, or start a new one.",
      current: "Open now",
      open: "Open",
      newProject: "New design system",
      renameLabel: "New name",
      deleteConfirm: "Delete it",
      list: "Your projects",
    },
    /** The "Showing examples in" group that lists your projects. */
    examplesGroup: "Your design systems",
  },

  /** The preview's own controls: the five example pages and the width switch (S52). */
  preview: {
    pagesLabel: "Example pages",
    pages: {
      landing: "Landing page",
      signup: "Sign-up form",
      settings: "Settings screen",
      article: "Article",
      all: "All components",
    },
    widthLabel: "Screen width",
    widths: { phone: "Phone", tablet: "Tablet", desktop: "Desktop" },
  },

  /** What the Check step says about a cause. `{count}` places are affected. */
  check: {
    /** One sentence per cause (S47). `explain.ts` adds `affected` after it. */
    causes: {
      brandLight: "Your brand colour is too light for white text.",
      brandDark: "Your brand colour is too dark for dark text.",
      highlight: "Your highlight colour is hard to read.",
      background:
        "The feel you chose for your backgrounds makes some text hard to read.",
      handSet: "A colour you set by hand is hard to read.",
      other: "Some text is hard to read on its background.",
    },
    /** `{count}` places are affected; `{example}` is a name from `roleNames`. */
    affectedOne: "1 place is affected, for example {example}.",
    affectedMany: "{count} places are affected, for example {example}.",
    before: "Before",
    after: "After",
    /** Used when a colour has no name in `roleNames`. */
    unnamedPlace: "some text",
    /** The Check step's own words (S56). */
    sampleLabel: "A sample of the colours that are hard to read",
    sampleText: "Aa Sample text",
    hideIt: "Hide it",
    fixAll: "Fix all",
    /** "Show me" found nothing on the example page that is open. */
    noPlace:
      "The example page you have open does not show this. Try another page.",
    shownOne: "Showing 1 place in the preview.",
    shownMany: "Showing {count} places in the preview.",
    /** "Fix it for me" could not find a colour near this one that works. */
    noFix:
      "We could not find a nearby colour that fixes this. Try choosing another colour.",
    fixedTitle: "Fixed",
    fixedSummary: "{count} left to fix.",
    allFixed: "Nothing is left to fix.",
    /** The disclosure for people who want the numbers. */
    detailsRow: "{fg} on {bg}: {ratio} to 1, needs {min} to 1",
    detailsNone: "Every colour pair is at or above its minimum.",
    /** The list of every decision, each linking to its step. */
    builtTitle: "What you've built",
    builtLead: "Every choice you made. Use a link to change one.",
    /**
     * Plain names for the colours a pair is made of, keyed by the role's variable name
     * without the `--ds-` prefix. A name stands for the place the colour shows up, not for
     * the colour. A dark-section colour (`on-inverse-link`) uses its plain role's name.
     */
    roleNames: {
      "text-primary": "body text",
      "text-muted": "quiet text",
      "text-inverse": "text on dark sections",
      "text-on-brand": "text on coloured sections",
      "text-link": "links",
      "text-link-hover": "links you point at",
      "text-accent": "highlighted text",
      "accent-border": "highlight outlines",
      "action-primary-fg": "main buttons",
      "action-primary-bg": "main buttons",
      "action-primary-bg-hover": "main buttons you point at",
      "action-primary-bg-active": "main buttons you press",
      "action-secondary-fg": "second buttons",
      "action-secondary-bg": "second buttons",
      "action-secondary-bg-hover": "second buttons you point at",
      "action-secondary-bg-active": "second buttons you press",
      "action-secondary-border": "second buttons",
      "focus-ring": "the outline around what you tab to",
      "border-control": "outlines of form fields",
      "input-border": "outlines of form fields",
      "input-border-hover": "outlines of form fields",
      "input-bg": "form fields",
      "input-placeholder": "hint text in form fields",
      "menu-highlight-fg": "the chosen item in a list",
      "menu-highlight-bg": "the chosen item in a list",
      "feedback-danger-fg": "error messages",
      "feedback-danger-bg": "error messages",
      "feedback-danger-border": "error messages",
      "surface-canvas": "page backgrounds",
      "surface-subtle": "soft backgrounds",
      "surface-raised": "cards",
      "surface-inverse": "dark sections",
      "surface-brand": "coloured sections",
    },
  },

  /** An error is one sentence, then a suggestion. */
  errors: {
    colourInvalid: {
      message: "That colour did not work.",
      fix: "Try a hex code such as #3366cc, or pick one from the wheel.",
    },
    fontInvalid: {
      message: "That font name did not work.",
      fix: "Use letters, numbers and spaces only, such as Space Grotesk.",
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
    stateInvalid: {
      message: "We could not apply your choices.",
      fix: "We show your starting look instead.",
    },
    deleteProject: {
      message: "Delete this project?",
      fix: "You can not get it back, so download it first if you might need it.",
    },
  },
} as const;
