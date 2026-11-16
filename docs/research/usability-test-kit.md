# Usability test kit

For the three test rounds of Release 2 (D-127, D-130): **T0** on the quick-wins site, **T1** on the Builder before launch, **T2** before the release closes. The maintainer runs the sessions; this kit is the script. Results go in `docs/research/<date>-t<n>.md` and are written only after the sessions have happened.

## What a round is for

Finding problems and the words people use, not measuring. Six people cannot give a percentage (NN/g: numbers need at least 20 users), so a round reports **problems with a severity**, quotes and vocabulary. Small rounds repeated are worth more than one large round.

## Who to recruit

Six people per round, two per group. Use different people in each round where you can.

| Group                      | Include someone who                                                 | Screen out                                 |
| -------------------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| Maker                      | Is building or planning their own website or app without a designer | Works as a designer or front-end developer |
| Designer who does not code | Designs screens or brand material and hands them to developers      | Writes CSS or uses design tokens at work   |
| Brand or marketing         | Owns or applies brand guidelines (colours, fonts, logo)             | Has built a design system before           |

For every group, screen out anyone who has seen this project before, and anyone who knows what a "design token" is (ask at the end of the screener, not the start, so the word is not planted).

**Screener questions**

1. What do you do for work, in a sentence?
2. In the last year, have you made or commissioned a website, an app or brand material? What was your part?
3. Who decides how it looks? Who builds it?
4. Have you written CSS or front-end code in the last year?
5. Have you heard the phrases "design system" or "design token"? What do they mean to you?

## Before the round

- Run **one pilot** with anyone at all and fix the script, not the product.
- One laptop-sized browser window (not a phone) for T0; in T1 one person per group uses a phone.
- Ask to record the screen and voice. Say this, and wait for a yes: "I'd like to record the screen and our voices so I don't have to take notes while we talk. Only I will watch it, and I'll delete it when the notes are written. Is that all right?"
- Recordings stay out of the repository. Notes use **P1 to P6**, never names, employers or anything that identifies a person.

## Moderator rules

1. Say at the start: "I'm testing the site, not you. There are no wrong answers. Please think out loud: say what you're looking at, what you expect and what surprises you."
2. **Do not explain the interface, and do not use its words** before the participant does. Say "this" and point.
3. When someone is stuck, wait. Then ask "What are you looking for?" or "What would you expect to happen?" Never "Did you see the button?".
4. If you have to help so the session can continue, help with the smallest hint and mark the task **assisted**.
5. Do not defend the design or promise fixes. "Thank you, that's useful" is enough.
6. Keep to 30 minutes.

## Session outline (30 minutes)

| Minutes | Part                                          |
| ------- | --------------------------------------------- |
| 2       | Welcome, consent, the think-aloud instruction |
| 5       | Opening questions                             |
| 15      | Tasks                                         |
| 5       | Vocabulary probes                             |
| 3       | Closing questions                             |

## Opening questions

1. Tell me about the last time you needed something (a site, an app, a document) to look consistent. What did you do? What got in the way?
2. When you hand a look to someone who builds it, what do you give them?
3. In your own words, what is a design system? (Any answer is fine, including "I don't know". Write it down word for word.)

## Tasks

Read each task aloud once and hand it over on a card. Use the participant's real brand when they have one; otherwise use the brief. The tasks avoid the interface's own words on purpose.

**Brief when there is no real brand:** "A friend is opening a small bakery called Crumb and asked you to sort out how its website should look. They like warm colours and want it to feel friendly."

**T0 (quick-wins site)**

1. Start at the home page. "Make the examples on this site look right for your brand (or for Crumb). Stop when you would be happy to show it to someone."
2. "You're happy with it. Get it to the person who will build the website."
3. "You'll need a form where people sign up to a newsletter. Find out whether this has what you need, and show me what you would pass on."

**T1 and T2 (Builder)**

1. Start at the home page. "Make a look for your brand (or for Crumb). Stop when you would be happy to show it to someone."
2. Hand over a card with a pale colour (`#F5E050`). "Your logo uses this yellow. Use it as the main colour and make sure people can read everything."
3. "Send what you made to the person who will build the website, and give your manager something they can look at."
4. "You've changed your mind about one thing. Change it. Then go back to how it was."

After each task ask: "Overall, how easy or difficult was that, from 1 (very difficult) to 7 (very easy)?" Record the number and the reason. The numbers are a prompt for conversation, not a result to average.

## Vocabulary probes

For each term below that is on screen in this round, point at it **before** the participant has used it and ask: "What would you expect this to change?" Then, after they have used it: "What would you call that?" Write both answers word for word.

Draft terms (spec 4.10): Starting look · Brand colour · Highlight colour · Background feel · Corners · Outline · Spacing · Shadows · Motion · Text size · Readability check · Fix it for me · Use it · Share link · Style guide · Design system.

**Gate:** a term that two or more of six people misread is renamed before the content file is final (S44).

## Closing questions

1. What was the hardest part? What was the most useful?
2. In your own words now, what is a design system?
3. What did the main colour change? What did the second colour change? (T1 and T2: what did the readability check do?)
4. If you could change one thing about this, what would it be?
5. Is there anything you expected to find and did not? (Listen for dark mode, their own font, a logo.)

## Severity

| Severity | Meaning                                                                      |
| -------- | ---------------------------------------------------------------------------- |
| Critical | The participant could not finish the task                                    |
| Serious  | Finished only with help, or finished with a wrong result they did not notice |
| Minor    | Hesitation, a wrong turn they recovered from, or an annoyance                |

## Note sheet (one per participant)

```
Participant: P_   Group: maker / designer / marketer   Device:   Date:
"Design system" before:
Task 1: done / assisted / not done   Ease 1-7:   Where they hesitated:   Quotes:
Task 2: …
Task 3: …
Task 4: …
Vocabulary (term → expected → their own word):
"Design system" after:
Hardest / most useful / one change / expected but missing:
```

## Findings file (one per round)

`docs/research/<date>-t<n>.md` holds: who took part (groups and devices only), the site version tested, and one table:

| #   | Problem | Where | Seen with | Severity | Evidence (quote or what happened) | Proposed change |
| --- | ------- | ----- | --------- | -------- | --------------------------------- | --------------- |

Then the vocabulary table (term, what people expected, what they called it, keep or rename) and anything people asked for that does not exist. No percentages, no averages.
