"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildIndex = void 0;
const tslib_1 = require("tslib");
/* eslint @typescript-eslint/no-var-requires: 0 */
const lunr_1 = tslib_1.__importDefault(require("lunr"));
let pluginInitialized = false;
let plugin;
function buildIndex(allDocuments, { language, removeDefaultStopWordFilter, removeDefaultStemmer, zhUserDict, zhUserDictPath, }) {
    if (!pluginInitialized) {
        pluginInitialized = true;
        if (language.length > 1 || language.some((item) => item !== "en")) {
            require("lunr-languages/lunr.stemmer.support")(lunr_1.default);
        }
        if (language.includes("ja") || language.includes("jp")) {
            require("lunr-languages/tinyseg")(lunr_1.default);
        }
        for (const lang of language.filter((item) => item !== "en" && item !== "zh")) {
            require(`lunr-languages/lunr.${lang}`)(lunr_1.default);
        }
        if (language.includes("zh")) {
            const { tokenizer, loadUserDict } = require("./tokenizer");
            loadUserDict(zhUserDict, zhUserDictPath);
            require("../../shared/lunrLanguageZh").lunrLanguageZh(lunr_1.default, tokenizer);
        }
        if (language.length > 1) {
            require("lunr-languages/lunr.multi")(lunr_1.default);
        }
        if (language.length > 1) {
            plugin = lunr_1.default.multiLanguage(...language);
        }
        else if (language[0] !== "en") {
            plugin = lunr_1.default[language[0]];
        }
    }
    // Some documents may be empty (unset array item), which is not mapped.
    return new Array(allDocuments.length)
        .fill(null)
        .map((_doc, index) => { var _a; return (_a = allDocuments[index]) !== null && _a !== void 0 ? _a : []; })
        .map((documents) => ({
        documents,
        index: (0, lunr_1.default)(function () {
            var _a;
            if (plugin) {
                this.use(plugin);
            }
            // Sometimes we need no English stop words,
            // since they are almost all programming code.
            for (const lang of language) {
                if (removeDefaultStopWordFilter.includes(lang)) {
                    if (lang === "en") {
                        this.pipeline.remove(lunr_1.default.stopWordFilter);
                    }
                    else {
                        const stopWordFilter = (_a = lunr_1.default[lang]) === null || _a === void 0 ? void 0 : _a.stopWordFilter;
                        if (stopWordFilter) {
                            this.pipeline.remove(stopWordFilter);
                        }
                    }
                }
            }
            if (removeDefaultStemmer) {
                this.pipeline.remove(lunr_1.default.stemmer);
            }
            // Override tokenizer when language `zh` is enabled.
            if (language.includes("zh")) {
                this.tokenizer = lunr_1.default.zh.tokenizer;
            }
            this.ref("i");
            this.field("t");
            this.metadataWhitelist = ["position"];
            documents.forEach((doc) => {
                this.add(Object.assign(Object.assign({}, doc), { 
                    // The ref must be a string.
                    i: doc.i.toString() }));
            });
        }),
    }));
}
exports.buildIndex = buildIndex;
