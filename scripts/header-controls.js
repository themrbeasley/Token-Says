import { tokenSays } from './token-says.js';

/*
 * Token Says header controls for Foundry V13
 *
 * This script registers header buttons for the TokenConfig and
 * PrototypeTokenConfig sheets in Foundry V13.  When using
 * DocumentSheetV2, header buttons are stored in a dropdown menu
 * accessed via the three-dot icon.  We push our control onto the
 * controls array via the getHeaderControls hooks.
 */

Hooks.once("init", () => {
  // Only apply the header controls for Foundry V13 and later
  const version = game.version ?? game.release?.version;
  if (!version) return;
  // We treat any version starting with "13" as a V13 series release
  const isV13 = version.startsWith("13");
  if (!isV13) return;

  /**
   * Determine the actor associated with a TokenConfig or PrototypeTokenConfig.
   *
   * @param {Object} app The application instance
   * @returns {Actor|null}
   */
  function getActorFromApp(app) {
    // TokenConfig uses `object` for the TokenDocument
    const token = app.token ?? app.object ?? app.document ?? null;
    return token ? token.actor ?? null : null;
  }

  /**
   * Create and register a header control for the Token Says module.
   *
   * @param {Object} app The application instance
   * @param {Array} controls The array of ApplicationHeaderControlsEntry objects
   */
  function addTokenSaysControl(app, controls) {
    controls.push({
      icon: "fa-solid fa-comment-dots",
      label: "Token Says",
      name: "token-says",
      visible: () => {
        // Show to GMs and users with GM-type permissions
        return game.user?.isGM ?? false;
      },
      onClick: () => {
        const actor = getActorFromApp(app);
        // Open the Token Says settings form using the same logic
        // used by the module's original token header button.  The
        // TokenSaysSettingsConfig instance is created during module
        // initialization and stored on the tokenSays class.
        const form = tokenSays.TokenSaysSettingsConfig;
        if (form) {
          // Populate search field with the token name if available
          const tokenName = actor?.name ?? app.token?.name ?? null;
          if (tokenName && typeof form.setLastSearch === 'function') {
            form.setLastSearch(tokenName.trim());
          }
          form.render(true);
        }
      }
    });
  }

  // Add controls for TokenConfig (placeable tokens)
  Hooks.on("getHeaderControlsTokenConfig", (app, controls) => {
    addTokenSaysControl(app, controls);
  });
  // Add controls for PrototypeTokenConfig (prototype tokens on actors)
  Hooks.on("getHeaderControlsPrototypeTokenConfig", (app, controls) => {
    addTokenSaysControl(app, controls);
  });
});