/* ============================================================
   QA REVIEW WHEEL — SETTINGS
   This is the only file you need to edit.
   ============================================================ */

window.WHEEL_CONFIG = {
  /* The marketing team, exactly as each name should appear on the
     wheel. Each person's email is built from their name using
     emailPattern below, so spell names the way the email is spelled. */
  team: [
    "Alexa Michos",
    "Arnaud Barthelemy",
    "Carlos-David Donoso",
    "Eddy Bastide",
    "Laura Cabrera",
    "Naomi Jung",
  ],

  /* Anyone on vacation or out of office. Copy their name here, for
     example ["Naomi Jung"], and they are left off the wheel until you
     remove it again. */
  away: [],

  /* The QA project in Asana ("QA Wheel of Review"). Tasks are created
     here and assigned to the reviewer. Everyone on the team must be a
     member of this project. */
  asanaProjectId: "1219075338426768",

  /* Backup only: the QA project's Asana email address. When someone
     hasn't connected Asana yet, or Asana can't be reached, the wheel
     opens an email copied to this address instead, and Asana turns it
     into an unassigned task. */
  asanaProjectEmail: "x+1219075338426768@mail.asana.com",

  /* How email addresses are built from a name. Accents and hyphens
     are dropped, so "Carlos-David Donoso" becomes
     carlosdavid.donoso@veriforce.com. */
  emailPattern: "{first}.{last}@veriforce.com",

  /* Default due date for the review, in business days after the spin. */
  dueInBusinessDays: 2,
};
