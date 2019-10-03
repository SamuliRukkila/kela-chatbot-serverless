"use strict";
/**
 * Informs Amazon Lex that the user is expected to
 * provide a slot value in the response.
 *
 * The intentName, slotToElicit, and slots fields
 * are required. The message and responseCard fields
 * are optional. If you don't specify a message,
 * Amazon Lex uses one of the slot elicitation prompts
 * configured for the slot.
 *
 * @example fullfillmentState = "Fullfilled" / "Failed"
 * @example contentType = "PlainText" / "SSML" / "CustomPayload"
 */
Object.defineProperty(exports, "__esModule", { value: true });
var DialogElicitSlot = /** @class */ (function () {
    function DialogElicitSlot() {
    }
    return DialogElicitSlot;
}());
exports.DialogElicitSlot = DialogElicitSlot;
//# sourceMappingURL=DialogElicitSlot.js.map