"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const junitTestResultParser = __importStar(require("./junit-test-result-parser"));
const nunitTestResultParser = __importStar(require("./nunit-test-result-parser"));
const mstestTestResultParser = __importStar(require("./mstest-test-result-parser"));
const tagging_1 = require("./tagging");
const metrics_1 = require("./metrics");
function parse(testFramework, testReportFile) {
    switch (testFramework) {
        case 'junit':
            junitTestResultParser.parse(testReportFile);
        case 'nunit':
            nunitTestResultParser.parse(testReportFile);
        case 'mstest':
            mstestTestResultParser.parse(testReportFile);
        default:
            throw new Error(testFramework + ' is not supported');
    }
}
function run(client, inputs) {
    return __awaiter(this, void 0, void 0, function* () {
        let allMetrics = [];
        for (const testReportFile of yield inputs.testReportFiles) {
            const testResults = parse(inputs.testFramework, testReportFile);
            const taggedTestCases = tagging_1.tagTestResults(testResults, inputs.testTagsFile);
            const metrics = metrics_1.buildAllMetrics(taggedTestCases, inputs.metricName, inputs.host);
            allMetrics = [...allMetrics, ...metrics];
        }
        client.sendMetrics(allMetrics);
    });
}
exports.run = run;