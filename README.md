![Latest Release Download Count](https://img.shields.io/github/downloads/themrbeasley/Token-Says/latest/Token-Says_1.13.4.zip)


# 📣 Token Says

Make your worlds louder, funnier, more dramatic, and more alive.
**Token Says** gives tokens the ability to speak, quip, hiss, roar, mutter, or make any other sound automatically based on in-game actions.

Use playlists, roll tables, or custom text to define what a token “says.”
Give characters personality. Give monsters flavor. Give your players a little chaos.

---

# 🎥 Video Overview

*(New updated video for Foundry V13 coming soon!)*

Current (older) video:
[https://youtu.be/_CRPy2LVicY](https://youtu.be/_CRPy2LVicY)

---

# ✨ Why Use Token Says?

* Characters can quip automatically during attacks.
* Monsters can roar when taking damage.
* NPCs can mutter when they move.
* Environmental tokens can react to players.

Sayings can be:

* Text
* Chat bubbles
* Audio from playlists
* Audio from compendiums
* Results from roll tables

Sayings can be:

* Randomized
* Scene-specific
* Token-specific
* Actor-type-specific
* Language-specific (Polyglot)
* Limited by chance or number of uses

You can set up:

* Critical-hit sayings
* Fumble sayings
* Token movement sayings
* Action-name-specific sayings
* Respond-to-other-token sayings
* Macro-triggered sayings

---

# 🧠 How It Works

Token Says watches for actions (attack, save, skill, movement, etc.) and checks them against the sayings you defined.
If a saying matches the trigger, Token Says creates:

* A chat bubble
* A chat message
* A sound
* Or all three

Priority rules ensure that more specific sayings override more generic ones.

---

# 📝 Configuring Sayings

(Add screenshot – **ADD YOUR IMAGE HERE after uploading**)

You can configure sayings from:

**Token or Prototype Token → top-right three-dot menu → Token Says**

There you can:

* Add new sayings
* Edit existing ones
* Copy sayings
* Delete sayings
* Import/export sayings
* Link sayings to roll tables or playlists
* Set chance %, limit, delay, volume, language, and more

---

# 🎛️ Token Form Access

To access Token Says for a specific token or actor:

1. Open the Token or Prototype Token configuration
2. Click the **three-dot menu** beside the “X”
3. Choose **Token Says**

This opens the full sayings editor.
<img width="1734" height="788" alt="Screenshot 2025-11-26 111244" src="https://github.com/user-attachments/assets/2208ce6d-9a46-4cb8-8b47-466133ec63bd" />

---

# 🧩 API / Macro Usage

Token Says provides two macro-accessible functions:

### `tokenSays.says(tokenId, actorId, sayingName)`

Triggers a specific, pre-defined saying.

### `tokenSays.saysDirect(tokenId, actorId, sceneId, options)`

Triggers a saying *without* needing a pre-defined entry. Perfect for modules and automation.

(Keep the original API block exactly as-is—it's good documentation.)

---

# 💡 Enhancements & Suggestions

Have an idea to improve Token Says?
Please submit feature requests or suggestions here:

👉 [https://github.com/themrbeasley/Token-Says/issues](https://github.com/themrbeasley/Token-Says/issues)

Community feedback drives development.

---

# 🙏 Acknowledgements

A huge thank-you to the original creators and contributors:

* **napolitanod** (original author)
* **Hanna**
* **DianeOfTheMoon**

And thank you to the community for using and supporting Token Says.
I’ll continue maintaining and updating this module for as long as the community finds it useful.

---

# 🛠️ System Compatibility

* D&D 5e
* PF1
* PF2e

# 🔌 Module Compatibility

* **Midi-QOL**
* **Polyglot**
