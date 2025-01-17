"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importStar(require("react"));
var size_sensor_1 = require("size-sensor");
var pick_1 = require("./helper/pick");
var is_function_1 = require("./helper/is-function");
var is_string_1 = require("./helper/is-string");
var is_equal_1 = require("./helper/is-equal");
/**
 * core component for echarts binding
 */
var EChartsReactCore = /** @class */ (function (_super) {
    tslib_1.__extends(EChartsReactCore, _super);
    function EChartsReactCore(props) {
        var _this = _super.call(this, props) || this;
        _this.echarts = props.echarts;
        _this.ele = null;
        _this.isInitialResize = true;
        return _this;
    }
    EChartsReactCore.prototype.componentDidMount = function () {
        this.renderNewEcharts();
    };
    // update
    EChartsReactCore.prototype.componentDidUpdate = function (prevProps) {
        /**
         * if shouldSetOption return false, then return, not update echarts options
         * default is true
         */
        var shouldSetOption = this.props.shouldSetOption;
        if ((0, is_function_1.isFunction)(shouldSetOption) && !shouldSetOption(prevProps, this.props)) {
            return;
        }
        // 以下属性修改的时候，需要 dispose 之后再新建
        // 1. 切换 theme 的时候
        // 2. 修改 opts 的时候
        // 3. 修改 onEvents 的时候，这样可以取消所有之前绑定的事件 issue #151
        if (!(0, is_equal_1.isEqual)(prevProps.theme, this.props.theme) ||
            !(0, is_equal_1.isEqual)(prevProps.opts, this.props.opts) ||
            !(0, is_equal_1.isEqual)(prevProps.onEvents, this.props.onEvents)) {
            this.dispose();
            this.renderNewEcharts(); // 重建
            return;
        }
        // when these props are not isEqual, update echarts
        var pickKeys = ['option', 'notMerge', 'lazyUpdate', 'showLoading', 'loadingOption', 'replaceMerge'];
        if (!(0, is_equal_1.isEqual)((0, pick_1.pick)(this.props, pickKeys), (0, pick_1.pick)(prevProps, pickKeys))) {
            this.updateEChartsOption();
        }
        /**
         * when style or class name updated, change size.
         */
        if (!(0, is_equal_1.isEqual)(prevProps.style, this.props.style) || !(0, is_equal_1.isEqual)(prevProps.className, this.props.className)) {
            this.resize();
        }
    };
    EChartsReactCore.prototype.componentWillUnmount = function () {
        this.dispose();
    };
    /*
     * initialise an echarts instance
     */
    EChartsReactCore.prototype.initEchartsInstance = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        // create temporary echart instance
                        _this.echarts.init(_this.ele, _this.props.theme, _this.props.opts);
                        var echartsInstance = _this.getEchartsInstance();
                        echartsInstance.on('finished', function () {
                            // get final width and height
                            var width = _this.ele.clientWidth;
                            var height = _this.ele.clientHeight;
                            // dispose temporary echart instance
                            _this.echarts.dispose(_this.ele);
                            // recreate echart instance
                            // we use final width and height only if not originally provided as opts
                            var opts = tslib_1.__assign({ width: width, height: height }, _this.props.opts);
                            resolve(_this.echarts.init(_this.ele, _this.props.theme, opts));
                        });
                    })];
            });
        });
    };
    /**
     * return the existing echart object
     */
    EChartsReactCore.prototype.getEchartsInstance = function () {
        return this.echarts.getInstanceByDom(this.ele);
    };
    /**
     * dispose echarts and clear size-sensor
     */
    EChartsReactCore.prototype.dispose = function () {
        if (this.ele) {
            try {
                (0, size_sensor_1.clear)(this.ele);
            }
            catch (e) {
                console.warn(e);
            }
            // dispose echarts instance
            this.echarts.dispose(this.ele);
        }
    };
    /**
     * render a new echarts instance
     */
    EChartsReactCore.prototype.renderNewEcharts = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, onEvents, onChartReady, _b, autoResize, echartsInstance;
            var _this = this;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.props, onEvents = _a.onEvents, onChartReady = _a.onChartReady, _b = _a.autoResize, autoResize = _b === void 0 ? true : _b;
                        // 1. init echarts instance
                        return [4 /*yield*/, this.initEchartsInstance()];
                    case 1:
                        // 1. init echarts instance
                        _c.sent();
                        echartsInstance = this.updateEChartsOption();
                        // 3. bind events
                        this.bindEvents(echartsInstance, onEvents || {});
                        // 4. on chart ready
                        if ((0, is_function_1.isFunction)(onChartReady))
                            onChartReady(echartsInstance);
                        // 5. on resize
                        if (this.ele && autoResize) {
                            (0, size_sensor_1.bind)(this.ele, function () {
                                _this.resize();
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // bind the events
    EChartsReactCore.prototype.bindEvents = function (instance, events) {
        function _bindEvent(eventName, func) {
            // ignore the event config which not satisfy
            if ((0, is_string_1.isString)(eventName) && (0, is_function_1.isFunction)(func)) {
                // binding event
                instance.on(eventName, function (param) {
                    func(param, instance);
                });
            }
        }
        // loop and bind
        for (var eventName in events) {
            if (Object.prototype.hasOwnProperty.call(events, eventName)) {
                _bindEvent(eventName, events[eventName]);
            }
        }
    };
    /**
     * render the echarts
     */
    EChartsReactCore.prototype.updateEChartsOption = function () {
        var _a = this.props, option = _a.option, _b = _a.notMerge, notMerge = _b === void 0 ? false : _b, _c = _a.lazyUpdate, lazyUpdate = _c === void 0 ? false : _c, showLoading = _a.showLoading, _d = _a.loadingOption, loadingOption = _d === void 0 ? null : _d, _e = _a.replaceMerge, replaceMerge = _e === void 0 ? [] : _e;
        // 1. get or initial the echarts object
        var echartInstance = this.getEchartsInstance();
        // 2. set the echarts option
        console.log(option);
        console.log(replaceMerge);
        echartInstance.setOption(option, { notMerge: notMerge, lazyUpdate: lazyUpdate, replaceMerge: replaceMerge });
        // 3. set loading mask
        if (showLoading)
            echartInstance.showLoading(loadingOption);
        else
            echartInstance.hideLoading();
        return echartInstance;
    };
    /**
     * resize wrapper
     */
    EChartsReactCore.prototype.resize = function () {
        // 1. get the echarts object
        var echartsInstance = this.getEchartsInstance();
        // 2. call echarts instance resize if not the initial resize
        // resize should not happen on first render as it will cancel initial echarts animations
        if (!this.isInitialResize) {
            try {
                echartsInstance.resize({
                    width: 'auto',
                    height: 'auto',
                });
            }
            catch (e) {
                console.warn(e);
            }
        }
        // 3. update variable for future calls
        this.isInitialResize = false;
    };
    EChartsReactCore.prototype.render = function () {
        var _this = this;
        var _a = this.props, style = _a.style, _b = _a.className, className = _b === void 0 ? '' : _b;
        // default height = 300
        var newStyle = tslib_1.__assign({ height: 300 }, style);
        return (react_1.default.createElement("div", { ref: function (e) {
                _this.ele = e;
            }, style: newStyle, className: "echarts-for-react ".concat(className) }));
    };
    return EChartsReactCore;
}(react_1.PureComponent));
exports.default = EChartsReactCore;
//# sourceMappingURL=core.js.map