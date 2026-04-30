"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const tslib_1 = require("tslib");
const cheerio = tslib_1.__importStar(require("cheerio"));
const parseDocument_1 = require("./parseDocument");
const parsePage_1 = require("./parsePage");
function parse(html, type, url, { ignoreCssSelectors, forceIgnoreNoIndex }) {
    var _a;
    const $ = cheerio.load(html);
    const robotsMeta = $('meta[name="robots"]');
    if (!forceIgnoreNoIndex && ((_a = robotsMeta.attr("content")) === null || _a === void 0 ? void 0 : _a.includes("noindex"))) {
        // Unlisted content
        return null;
    }
    // Remove copy buttons from code boxes
    $('div[class^="mdxCodeBlock_"] button').remove();
    if (ignoreCssSelectors) {
        for (const ignoreSelector of ignoreCssSelectors) {
            $(ignoreSelector).remove();
        }
    }
    if (type === "docs") {
        // Remove version badges
        $("span.badge")
            .filter((_, element) => $(element).text().startsWith("Version:"))
            .remove();
    }
    if (type === "page") {
        return (0, parsePage_1.parsePage)($, url);
    }
    return (0, parseDocument_1.parseDocument)($);
}
exports.parse = parse;
