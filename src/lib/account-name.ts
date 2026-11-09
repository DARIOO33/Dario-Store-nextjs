// Account names are shown in the header, the admin area and team emails. Someone signed up
// with a name full of HTML tags and pages of text: it could not run (React and the email
// templates escape it), but it filled the screens. Names are cleaned before they are saved,
// for email sign-ups and Google alike, instead of refusing them (a Google login must not fail
// over the name Google sends).
export const MAX_ACCOUNT_NAME = 60;

export function cleanAccountName(name: string): string {
  const cleaned = name
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Cut by characters, not UTF-16 units, so an emoji or Arabic letter is never split in half.
  return Array.from(cleaned).slice(0, MAX_ACCOUNT_NAME).join("").trim();
}
