"use strict";
/**
 * Informs Amazon Lex not to expect a response from the
 * user. For example, "Your pizza order has been placed"
 * does not require a response.
 *
 * The fulfillmentState field is required. Amazon Lex
 * uses this value to set the dialogState field in the
 * PostContent or PostText response to the client application.
 *
 * The message and responseCard fields are optional. If
 * you don't specify a message, Amazon Lex uses the goodbye
 * message or the follow-up message configured for the intent.
 *
 * @example fullfillmentState = "Fullfilled" / "Failed"
 * @example contentType = "PlainText" / "SSML" / "CustomPayload"
 */
Object.defineProperty(exports, "__esModule", { value: true });
var DialogClose = /** @class */ (function () {
    function DialogClose() {
    }
    return DialogClose;
}());
exports.DialogClose = DialogClose;
//# sourceMappingURL=DialogClose.js.map