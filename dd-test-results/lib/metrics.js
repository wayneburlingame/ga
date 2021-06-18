"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAllMetrics = void 0;
function buildAllMetrics(taggedTestCases, metricName, host) {
    return taggedTestCases
        .map(ttc => buildMetrics(includeRequiredTags(ttc), metricName, host))
        .reduce((total, current) => [...total, ...current]);
}
exports.buildAllMetrics = buildAllMetrics;
function buildMetrics(taggedTestCase, metricName, host) {
    return [
        {
            type: 'count',
            name: `${metricName}.count`,
            value: 1,
            tags: Object.keys(taggedTestCase.tags).map(key => `${key}:${taggedTestCase.tags[key]}`),
            host: host,
            interval: 0
        },
        {
            type: 'gauge',
            name: `${metricName}.avg`,
            value: taggedTestCase.duration * 1000,
            tags: Object.keys(taggedTestCase.tags).map(key => `${key}:${taggedTestCase.tags[key]}`),
            host: host,
            interval: 0
        }
    ];
}
function includeRequiredTags(taggedTestCase) {
    const tags = taggedTestCase.tags;
    tags['success'] = taggedTestCase.result === 'succeeded';
    if (!(`test_case` in tags)) {
        tags['test_case'] = taggedTestCase.name;
    }
    return Object.assign(Object.assign({}, taggedTestCase), { tags: tags });
}
