import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/components/forms");
  // Keyboard handlers exist only after hydration.
  await page.waitForLoadState("networkidle");
});

test.describe("keyboard operation", () => {
  test("Input takes typed text", async ({ page }) => {
    const input = page.getByLabel("Default");
    await input.focus();
    await page.keyboard.type("hello");
    await expect(input).toHaveValue("hello");
  });

  test("Checkbox toggles with Space", async ({ page }) => {
    const box = page.getByRole("checkbox", { name: "Unchecked" });
    await box.focus();
    await page.keyboard.press("Space");
    await expect(box).toBeChecked();
    await page.keyboard.press("Space");
    await expect(box).not.toBeChecked();
  });

  test("RadioGroup moves with arrow keys and skips disabled items", async ({
    page,
  }) => {
    const free = page.getByRole("radio", { name: "Free" });
    await free.focus();
    await page.keyboard.press("ArrowDown");
    const team = page.getByRole("radio", { name: "Team" });
    await expect(team).toBeFocused();
    await expect(team).toBeChecked();
    await page.keyboard.press("ArrowDown");
    await expect(free).toBeFocused();
  });

  test("Select opens with the keyboard and picks an option", async ({
    page,
  }) => {
    const trigger = page.getByRole("combobox", { name: "Produce" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toBeHidden();
    await expect(trigger).toContainText("Banana");
    await expect(trigger).toBeFocused();
  });

  test("Select closes with Escape", async ({ page }) => {
    const trigger = page.getByRole("combobox", { name: "Produce" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toBeHidden();
  });
});

test.describe("validation form", () => {
  const messages = {
    Email: "Enter your email address.",
    Country: "Choose your country.",
    "Contact me by": "Choose how we should contact you.",
    "I accept the terms": "Accept the terms to continue.",
  };

  test("errors are announced and linked to their controls", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Sign up" }).click();

    const email = page.getByRole("textbox", { name: /^Email/ });
    await expect(email).toHaveAttribute("aria-invalid", "true");
    const country = page.getByRole("combobox", { name: /^Country/ });
    await expect(country).toHaveAttribute("aria-invalid", "true");
    const terms = page.getByRole("checkbox", { name: /^I accept the terms/ });
    await expect(terms).toHaveAttribute("aria-invalid", "true");

    for (const message of Object.values(messages)) {
      await expect(
        page.getByRole("alert").filter({ hasText: message }),
      ).toBeVisible();
    }

    // aria-describedby on each control points at its error message.
    for (const [control, message] of [
      [email, messages.Email],
      [country, messages.Country],
      [terms, messages["I accept the terms"]],
    ] as const) {
      const ids = (await control.getAttribute("aria-describedby")) ?? "";
      const text = await page.evaluate(
        (list) =>
          list
            .split(" ")
            .map((id) => document.getElementById(id)?.textContent ?? "")
            .join(" "),
        ids,
      );
      expect(text).toContain(message);
    }
    const group = page.getByRole("radiogroup", { name: /^Contact me by/ });
    await expect(group).toHaveAttribute("aria-invalid", "true");
  });

  test("a bad email gets its own message, then a valid form succeeds", async ({
    page,
  }) => {
    await page.getByRole("textbox", { name: /^Email/ }).fill("nope");
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "like name@example.com" }),
    ).toBeVisible();

    await page.getByRole("textbox", { name: /^Email/ }).fill("a@b.co");
    await page.getByRole("combobox", { name: /^Country/ }).click();
    await page.getByRole("option", { name: "India" }).click();
    await page.getByRole("radio", { name: "Email" }).check();
    await page.getByRole("checkbox", { name: /^I accept the terms/ }).check();
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page.locator("form").getByRole("alert")).toHaveCount(0);
    await expect(page.getByRole("status")).toContainText("Thanks");
  });

  test("the form is axe clean with errors showing", async ({ page }) => {
    await page.getByRole("button", { name: "Sign up" }).click();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("the form is axe clean with a Select open", async ({ page }) => {
    await page.getByRole("combobox", { name: "Produce" }).click();
    await expect(page.getByRole("listbox")).toBeVisible();
    // Scoped to the list: Radix aria-hides the rest of the page while it is
    // open (including the off-screen skip link), and the portalled list sits
    // outside any landmark by design.
    const results = await new AxeBuilder({ page })
      .include('[role="listbox"]')
      .disableRules(["region"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
