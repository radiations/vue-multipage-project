/**
 * Created by 岳代平 on 2016/6/7.
 */
module.exports = function(config) {
    config.set({
        browsers: ['Chrome'],
        frameworks: ['jasmine'],
        files: [
            'src/assets/common/**/*.js',
            'test/**/*.js'
        ],
        exclude: [
        ],
        reporters: ['progress', 'html', 'coverage'],
        preprocessors : {
            'src/assets/common/**/*.js': 'coverage'
        },
        coverageReporter: {
            type : 'html',
            dir : 'reports/coverage/'
        },
        htmlReporter: {
            outputDir: 'reports/karma', // where to put the reports
            templatePath: null, // set if you moved jasmine_template.html
            focusOnFailures: true, // reports show failures on start
            namedFiles: true, // name files instead of creating sub-directories
            pageTitle: null, // page title for reports; browser info by default
            urlFriendlyName: true, // simply replaces spaces with _ for files/dirs
            reportName: 'reports', // report summary filename; browser info by default
            // experimental
            preserveDescribeNesting: true, // folded suites stay folded
            foldAll: true, // reports start folded (only with preserveDescribeNesting)
        },
        plugins: [
            'karma-jasmine',
            'karma-coverage',
            'karma-chrome-launcher',
            'karma-html-reporter'
        ]
    });
};