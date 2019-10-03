"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var validate_1 = require("./validate");
var response_1 = require("./response");
var dynamodb_1 = require("./dynamodb");
/**
 * Main function of user information -lambda. At this moment
 * only LEX will call this function. Function will consist
 * of three different scenarios which will be distruped by
 * conditional statement (if, else etc.).
 *
 * @param {Object} event Contains events send by LEX's bot
 */
module.exports.handler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var response, dynamoDB, pin, ddbRes, validate;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(event);
                console.log(event.currentIntent);
                response = new response_1.Response();
                if (!(event.currentIntent.confirmationStatus === 'Confirmed' &&
                    event.currentIntent.slots.Kela_PIN)) return [3 /*break*/, 2];
                dynamoDB = new dynamodb_1.DynamoDB();
                pin = event.currentIntent.slots.Kela_PIN;
                return [4 /*yield*/, dynamoDB.searchUserByPin(pin)];
            case 1:
                ddbRes = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                if (event.invocationSource === 'DialogCodeHook' && event.currentIntent.slots.Kela_PIN) {
                    validate = new validate_1.Validate();
                    // Validate PIN
                    validate.validatePin(event.currentIntent.slots.Kela_PIN);
                    // PIN's length is too short/long
                    if (validate.invalidLength) {
                        return [2 /*return*/, response.returnInvalidPin({
                                pin: validate.pin, errorMessage: "PIN is too " + validate.invalidLength
                            })];
                    }
                    // PIN's century -symbol is invalid
                    if (validate.invalidSymbol) {
                        return [2 /*return*/, response.returnInvalidPin({
                                pin: validate.pin, errorMessage: "Invalid century -symbol. Possible symbols (- & A)"
                            })];
                    }
                    // Pin is valid and user is required to confirm it
                    return [2 /*return*/, response.returnConfirmPin(validate.pin)];
                }
                /**
                 * 3. SCENARIO
                 *
                 * This will (and should) only happen when Lex is doing
                 * initialization call.
                 */
                else {
                    return [2 /*return*/, response.returnDelegate()];
                }
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=userInformation.js.map