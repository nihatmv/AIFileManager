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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIClient = void 0;
const axios_1 = __importDefault(require("axios"));
const YOUR_API_KEY = process.env.OPENAI_API_KEY || '';
// Define the OpenAI API client
class OpenAIClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    sendMessage(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const url = 'https://api.openai.com/v1/chat/completions';
            const message = [
                {
                    role: 'developer',
                    content: `${prompt}`,
                },
            ];
            const payload = {
                model: 'gpt-4o-mini', // Adjust the model if needed
                messages: message,
                max_tokens: 5000,
                temperature: 0,
            };
            try {
                const response = yield axios_1.default.post(url, payload, {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                });
                return response.data;
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    console.error('Axios Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                }
                else if (error instanceof Error) {
                    console.error('Error:', error.message);
                }
                else {
                    console.error('Unexpected error:', error);
                }
                throw error; // Re-throwing the error for higher-level handling
            }
        });
    }
}
exports.OpenAIClient = OpenAIClient;
