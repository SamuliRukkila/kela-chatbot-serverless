"use strict";
/**
 * Directs Amazon Lex to choose the next course
 * of action based on the bot configuration.
 * If the response does not include any session
 * attributes Amazon Lex retains the existing attributes.
 *
 * If you want a slot value to be null, you don't need
 * to include the slot field in the request. You will
 * get a DependencyFailedException exception if your
 * fulfillment function returns the Delegate
 * dialog action without removing any slots.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var DialogDelegate = /** @class */ (function () {
    function DialogDelegate() {
    }
    return DialogDelegate;
}());
exports.DialogDelegate = DialogDelegate;
//# sourceMappingURL=DialogDelegate.js.map