# QA Review Wheel: setup guide

The wheel is already set up for the team and the "QA Wheel of Review" project in Asana. There are three steps, in this order:

1. **Add the team to the Asana project** (you, 2 minutes)
2. **Publish the site** on GitHub Pages (you, 10 minutes)
3. **Connect Asana** (each teammate, once, 2 minutes)

## How it works

1. The author picks their name, describes the asset, and spins. The author is never on their own wheel.
2. The wheel lands on a reviewer and the confetti flies.
3. The wheel creates a task in the QA project, **assigns it to the reviewer**, and **sets the due date**. Asana then notifies the reviewer.

If someone hasn't connected Asana yet, or Asana can't be reached, the wheel falls back to the email version: it opens a ready-to-send email to the reviewer, copied to the project, which Asana turns into an unassigned task.

---

## Step 1: Add the team to the Asana project

Right now you're the only member of **QA Wheel of Review**, so nobody else can create or receive tasks in it.

1. Open the project in Asana and click **Share** (top right).
2. Add Alexa, Arnaud, Eddy, Laura and Naomi as members with **Editor** access.

---

## Step 2: Publish on GitHub Pages

The team doesn't have seats in Veriforce's GitHub organization, so the site is published from a **public** repository, which anyone with the link can open. That's safe for this setup: **no Asana key or password is in the site's code.** Each person's key stays in their own browser. The site shows only the team's names and the project's email address, so share the link inside the team only.

1. Sign in to GitHub and click **New repository** (the **+** at the top right). Use your personal account, not the Veriforce organization.
2. Name it `qa-review-wheel` and choose **Public**.
3. Click **Create repository**, then click **uploading an existing file**.
4. Drag in **everything inside** the `qa-review-wheel` folder: `index.html`, `styles.css`, `app.js`, `config.js`, `SETUP.md` and the `assets` folder. Click **Commit changes**.
5. Go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
6. After a minute or two, the address appears at the top of that page, something like `https://your-account.github.io/qa-review-wheel/`.
7. **Test it yourself first:** connect Asana (step 3), spin, and check that the task appears in the project, assigned to the reviewer. Then share the link with the team.

---

## Step 3: Connect Asana (each teammate, once)

Send the team the link with this note:

> The first time you open the wheel, click **Connect Asana** and follow the steps in the window. In short: in Asana, click your profile photo → **Settings** → **Apps** → **View developer console** → **Create new token**. Name it "QA Review Wheel", copy it, and paste it into the wheel. You only do this once on each computer.

Things to know about the token:
- **It stays in that person's browser** and is sent only to Asana. It never goes to GitHub or to anyone else.
- **It works like their Asana password**, so paste it only on their own computer, never a shared one.
- **To revoke it**, go to Asana's developer console and delete the token. To log out of the wheel, click **Disconnect**.
- **The labels may differ slightly.** Asana sometimes renames these menus. If "View developer console" isn't there, look for **Developer apps** or **Personal access tokens** under **Apps**.

---

## Day-to-day changes

Everything lives in `config.js`. To change it, open the file on GitHub, click the pencil icon, edit, then click **Commit changes**. The site updates within a minute or two.

| To… | Do this |
|---|---|
| Add a teammate | Add their name to `team`, spelled the way their email is spelled. Also add them to the Asana project. |
| Skip someone who's away | Add their name to `away`, for example `away: ["Naomi Jung"]`. Remove it when they're back. |
| Change the default due date | Change `dueInBusinessDays`. |

Accents and hyphens are dropped when the email is built, so "Carlos-David Donoso" becomes carlosdavid.donoso@veriforce.com. Assignment uses the same email, so it must be the address each person uses for Asana.

---

## Troubleshooting

The result card says why a task wasn't created and offers the email instead, so no review is lost.

| Message | What to do |
|---|---|
| "Your Asana connection has stopped working" | The token was deleted or expired. Click **Connect Asana** and paste a new one. |
| "You don't have access to the QA project" | Add that person to the project (step 1). |
| "Asana couldn't find [name] at [email]" | That person's Asana email differs from first.last@veriforce.com. Ask them which address they use. |
| "We couldn't reach Asana" | Check the internet connection and try the next spin. Use the email for this one. |
| No sound | Check that the page says **Sound on** (top right) and that the computer isn't muted. |
