import {ACTORTYPES, BYPASSNAMETYPES, determineMacroList, DOCUMENTNAMELABELS, GAMETYPEOPS, getWorldDocumentNameOptions, getCompendiumOps, getPolyglotLanguages, PLAYTYPE, PLAYTYPEROLLTABLE, WHISPEROPTIONS} from './constants.js';
import {tokenSays} from '../token-says.js';
import {says} from './says.js';
import {parseSeparator, wildcardName} from './helpers.js';

/**
 * Form for editing an individual saying.
 * ownerId = '' → GM saying (stored in world settings)
 * ownerId = userId → player saying (stored in that user's flags)
 *
 * Defined inside Hooks.once('init') so foundry.applications.api is available.
 */
export let TokenSaysSayForm;

Hooks.once('init', () => {
    const { ApplicationV2 } = foundry.applications.api;
    // HandlebarsApplicationMixin may be at either path depending on the Foundry build
    const HandlebarsApplicationMixin =
        foundry.applications.api.HandlebarsApplicationMixin ??
        foundry.applications.HandlebarsApplicationMixin;

    TokenSaysSayForm = class TokenSaysSayForm extends HandlebarsApplicationMixin(ApplicationV2) {
        constructor(sayId, ownerId = '', options = {}) {
            super(options);
            this.sayId = sayId;
            this.ownerId = ownerId;
        }

        static DEFAULT_OPTIONS = {
            id: "token-says-rules-rule",
            classes: ["sheet", "token-says-rule"],
            window: { title: "TOKENSAYS.setting.tokenSaysRule.name" },
            position: { width: 400 },
            form: { closeOnSubmit: true, handler: TokenSaysSayForm._onSubmit }
        };

        static PARTS = {
            form: { template: tokenSays.TEMPLATES.SAY }
        };

        _determineWorldOptions(reacts) {
            return reacts ? (({ reacts, ...o }) => o)(GAMETYPEOPS) : (({ say, ...o }) => o)(GAMETYPEOPS);
        }

        async _prepareContext(options) {
            const sy = says.getSay(this.sayId);
            return {
                say: sy,
                actorTypeOps: ACTORTYPES,
                documentTypeOptions: this._determineWorldOptions(false),
                documentTypeReactsOptions: this._determineWorldOptions(true),
                compendiumListRollTable: getCompendiumOps('rollTable'),
                compendiumListAudio: getCompendiumOps('audio'),
                documentNameLabel: this.documentNameLabel(sy.documentType),
                documentNameOptions: this._createNameOptionsHTML(sy.documentType, sy.documentName, ''),
                documentNameWildCardSuppress: this._suppressDocumentNameWildcard(sy.documentType),
                documentNameReactsOptions: this._createNameOptionsHTML(sy.to?.documentType, sy.to?.documentName, 'to.'),
                documentNameReactsWildCardSuppress: this._suppressDocumentNameWildcard(sy.to?.documentType),
                hasAudioFileTitle: sy.audioFileTitle ? true : false,
                hasChatFileTitle: sy.chatFileTitle ? true : false,
                isAudio: sy.isAudio,
                isMove: (sy.hasAudio && sy.documentType === 'move') ? true : false,
                isReact: sy.documentType === 'reacts' ? true : false,
                languageOptions: getPolyglotLanguages(),
                macroOps: determineMacroList(),
                playOptions: PLAYTYPE,
                rollTablePlayOptions: PLAYTYPEROLLTABLE,
                responseDocumentNameLabel: this.documentNameLabel(sy.to?.documentType),
                whisperOps: WHISPEROPTIONS
            };
        }

        _onRender(context, options) {
            super._onRender(context, options);
            const html = this.element;

            // --- Tab navigation ---
            const tabItems = html.querySelectorAll('.tabs .item');
            const tabPanels = html.querySelectorAll('.tab');
            tabItems.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabName = e.currentTarget.dataset.tab;
                    tabItems.forEach(t => t.classList.remove('active'));
                    tabPanels.forEach(t => t.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    html.querySelector(`.tab[data-tab="${tabName}"]`)?.classList.add('active');
                });
            });

            // --- Event listeners ---
            html.querySelector('#token-says-documenttype-value')
                ?.addEventListener('change', (e) => {
                    this._refreshDocumentNameOptions(e.currentTarget.value, '');
                    const reactsDiv = html.querySelector('#token-says-reacts');
                    const reactsTab = html.querySelector('[data-tab="reacts"]');
                    if (e.currentTarget.value === 'reacts') {
                        reactsDiv?.classList.remove('hidden');
                        reactsTab?.classList.remove('hidden');
                    } else {
                        reactsDiv?.classList.add('hidden');
                        reactsTab?.classList.add('hidden');
                    }
                    const capDiv = html.querySelector('#token-says-cap');
                    if (capDiv) {
                        e.currentTarget.value === 'move'
                            ? capDiv.classList.remove('hidden')
                            : capDiv.classList.add('hidden');
                    }
                    const lbl = html.querySelector('#token-says-documentname-label');
                    if (lbl) lbl.innerHTML = this.documentNameLabel(e.currentTarget.value);
                });

            html.querySelector('#token-says-documenttype-reacts-value')
                ?.addEventListener('change', (e) => {
                    this._refreshDocumentNameOptions(e.currentTarget.value, 'to.');
                    const lbl = html.querySelector('#token-says-documentname-reacts-label');
                    if (lbl) lbl.innerHTML = this.documentNameLabel(e.currentTarget.value);
                    this._duplicateNameWarning();
                });

            html.querySelector('#token-says-fileTitle-audio-value')
                ?.addEventListener('change', (e) => {
                    const audioSeq = html.querySelector('#token-says-play-type-audio-label');
                    if (audioSeq) {
                        e.currentTarget.value
                            ? audioSeq.classList.add('hidden')
                            : audioSeq.classList.remove('hidden');
                    }
                });

            html.querySelector('#token-says-fileTitle-chat-value')
                ?.addEventListener('change', (e) => {
                    for (const id of ['#token-says-fileName-chat-label', '#token-says-compendium-chat-label', '#token-says-play-type-chat-label']) {
                        const el = html.querySelector(id);
                        if (el) {
                            e.currentTarget.value
                                ? el.classList.add('hidden')
                                : el.classList.remove('hidden');
                        }
                    }
                });

            html.querySelector('#token-says-documentname-reacts-value')
                ?.addEventListener('change', () => this._duplicateNameWarning());

            html.querySelector('#token-says-name-value')
                ?.addEventListener('input', () => {
                    this._duplicateNameWarning();
                    this._existsCheck('name');
                });

            html.querySelector('#token-says-name-is-actor')
                ?.addEventListener('change', () => this._existsCheck('name'));
            html.querySelector('#token-says-name-is-wildcard')
                ?.addEventListener('change', () => this._existsCheck('name'));
            html.querySelector('#token-says-to-name-value')
                ?.addEventListener('input', () => this._existsCheck('to-name'));
            html.querySelector('#token-says-to-name-is-actor')
                ?.addEventListener('change', () => this._existsCheck('to-name'));
            html.querySelector('#token-says-to-name-is-wildcard')
                ?.addEventListener('change', () => this._existsCheck('to-name'));

            // Initial state
            this._duplicateNameWarning();
            this._notExistsWarning();
        }

        async _refreshDocumentNameOptions(documentType, reacts) {
            const html = this.element;
            const reactsHTML = reacts ? '-reacts' : '';
            const documentName = html.querySelector(`#token-says-documentname${reactsHTML}-value`)?.value ?? '';
            const documentNameSelectHTML = html.querySelector(`#token-says-documentname${reactsHTML}`);
            if (documentNameSelectHTML) {
                documentNameSelectHTML.innerHTML = this._createNameOptionsHTML(documentType, documentName, reacts);
            }
            this._documentNameWildcardHTML(documentType, reactsHTML);
        }

        _documentNameWildcardHTML(documentType, reacts) {
            const suppress = this._suppressDocumentNameWildcard(documentType);
            const wc = this.element.querySelector(`#token-says-documentname${reacts}-is-wildcard`);
            const formGroup = this.element.querySelector(`#token-says-documentname${reacts}-is-wildcard-formgroup`);
            if (!wc) return;
            if (suppress) {
                wc.checked = false;
                formGroup?.classList.add('hidden');
            } else {
                formGroup?.classList.remove('hidden');
            }
        }

        _suppressDocumentNameWildcard(documentType) {
            return (BYPASSNAMETYPES.includes(documentType) || documentType === 'reacts' || getWorldDocumentNameOptions(documentType)) ? true : false;
        }

        _createNameOptionsHTML(documentType, documentName, reacts) {
            let finalHTML = '', reactsHTML = reacts ? '-reacts' : '', disabled = '';
            documentName = documentName ? documentName : '';
            const optionListOptions = getWorldDocumentNameOptions(documentType);
            if (optionListOptions) {
                const sortedList = optionListOptions.dontSort ? optionListOptions : Object.entries(optionListOptions).sort(([,a],[,b]) => a.localeCompare(b));
                let optionList = '<option value=""></option>';
                for (let i = 0; i < sortedList.length; i++) {
                    let selected = '';
                    if (sortedList[i][0] === documentName) {
                        selected = ' selected ';
                    }
                    optionList += '<option value="' + sortedList[i][0] + '" ' + selected + '>' + sortedList[i][1] + '</option>';
                }
                finalHTML = `<select id="token-says-documentname${reactsHTML}-value" name="${reacts}documentName" value="` + documentName + '">' + optionList + '</select>';
            } else {
                if (BYPASSNAMETYPES.includes(documentType) || documentType === 'reacts') { disabled = ' disabled '; }
                finalHTML = `<input id="token-says-documentname${reactsHTML}-value" type="text" name="${reacts}documentName" value="` + documentName + '" ' + disabled + '/>';
            }
            return finalHTML;
        }

        documentNameLabel(documentType) {
            return (documentType && DOCUMENTNAMELABELS[documentType]) ? game.i18n.localize(DOCUMENTNAMELABELS[documentType]) : game.i18n.localize(DOCUMENTNAMELABELS['']);
        }

        // `this` is bound to the instance by ApplicationV2 when calling the handler
        static async _onSubmit(event, form, formData) {
            try {
                const expandedData = foundry.utils.expandObject(formData.object);
                if (this.ownerId) {
                    if (game.user.isGM) {
                        await says.updatePlayerSayForUser(this.ownerId, expandedData.id, expandedData, true);
                    } else {
                        await says.updatePlayerSay(expandedData.id, expandedData, true);
                    }
                } else {
                    await says.updateSay(expandedData.id, expandedData, true);
                }
                tokenSays.TokenSaysSettingsConfig?.refresh();
            } catch (err) {
                console.error('Token Says | Error saving saying:', err);
                ui.notifications?.error('Token Says: Failed to save saying. Check the console for details.');
            }
        }

        _duplicateNameWarning() {
            const html = this.element;
            const warning = html?.querySelector('#token-says-rule-dup-name-warning');
            if (!warning) return;

            const reactsTypeEl = html.querySelector('#token-says-documenttype-reacts-value');
            if (!reactsTypeEl) return;

            if (reactsTypeEl.value === 'say') {
                html.querySelector('#token-says-to-name')?.classList.add('hidden');
                const toNameActor = html.querySelector('#token-says-to-name-is-actor');
                if (toNameActor) toNameActor.disabled = true;

                const reactsId = html.querySelector('#token-says-documentname-reacts-value')?.value;
                const nameVal = html.querySelector('#token-says-name-value')?.value;
                if (nameVal === says.getSay(reactsId)?.name) {
                    warning.classList.remove('hidden');
                } else {
                    warning.classList.add('hidden');
                }
            } else {
                warning.classList.add('hidden');
                html.querySelector('#token-says-to-name')?.classList.remove('hidden');
                const toNameActor = html.querySelector('#token-says-to-name-is-actor');
                if (toNameActor) toNameActor.disabled = false;
            }
        }

        _notExistsWarning() {
            this._existsCheck('name');
            this._existsCheck('to-name');
        }

        _existsCheck(id) {
            if (id === 'name' || id === 'to-name') {
                const fails = [];
                const isWildcard = this.element.querySelector(`#token-says-${id}-is-wildcard`)?.checked ?? false;
                const isActor = this.element.querySelector(`#token-says-${id}-is-actor`)?.checked ?? false;
                const warnId = isActor ? 'actor' : 'token';

                this.element.querySelector(`#token-says-${id}-token-warning-container`)?.classList.add('hidden');
                this.element.querySelector(`#token-says-${id}-actor-warning-container`)?.classList.add('hidden');

                const nameConcat = this.element.querySelector(`#token-says-${id}-value`)?.value;
                if (nameConcat) {
                    const namesParsed = parseSeparator(nameConcat);
                    const nameList = !isWildcard
                        ? namesParsed
                        : wildcardName(isActor ? game.actors : [...new Set(game.scenes.map(s => s.tokens.map(t => t.name)).flat())], namesParsed, isActor ? false : true);

                    if (namesParsed.length > 0 && !nameList.length) {
                        fails.push(nameConcat);
                    } else if (isActor) {
                        for (const actorName of nameList) {
                            if (!game.actors.getName(actorName)) { fails.push(actorName); }
                        }
                    } else {
                        for (const tokenName of nameList) {
                            if (!game.scenes.find(s => s.tokens.find(t => t.name === tokenName))) { fails.push(tokenName); }
                        }
                    }
                }

                const warning = this.element.querySelector(`#token-says-${id}-${warnId}-warning`);
                if (fails.length) {
                    if (warning) warning.innerHTML = fails.join(', ');
                    this.element.querySelector(`#token-says-${id}-${warnId}-warning-container`)?.classList.remove('hidden');
                } else {
                    if (warning) warning.innerHTML = '';
                }
            }
        }
    };
});
