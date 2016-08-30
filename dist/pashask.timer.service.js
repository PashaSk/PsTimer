/*
momentjs is required

*/
(function() {
    angular.module("ps.timer", [])
        .service("psTimer", ["$interval", psTimerService]);

    function psTimerService($interval) {
        var self = this;
        var globalKey = 0;
        var TimerInstances = [];
        self = {
            initTimer: function(timerObj, freezeStart) {

                var key = ++globalKey;

                var Timer = function() {

                    var innerInterval = "";
                    var durationInst = moment.duration(timerObj);
                    var periodSuperiority = "";

                    var durationFnBinding = {
                        'd' : 'days',
                        'h' : 'hours',
                        'm' : 'minutes',
                        's' : 'seconds',
                        'ms' : 'milliseconds'
                    };

                    //public
                    this.isRemoved = false;
                    this.isStoped = false;
                    this.stop = function() {
                        $interval.cancel(innerInterval);
                    };
                    this.resume = function() {
                        if (!innerInterval || innerInterval.$$state && innerInterval.$$state.value == "canceled") {
                            initInterval();
                        }
                    };
                    this.remove = function() {

                        this.stop();
                        this.isRemoved = true;
                        this.format = function() {};

                        delete this.duration;
                        delete TimerInstances[key];

                    };
                    this.reset = function() {
                        durationInst = moment.duration({hours: 0, minutes: 0, seconds: 0, milliseconds: 0});
                    };
                    this.shift = function(shiftObj) {
                      durationInst.add(shiftObj);
                    };
                    this.duration = function() { return durationInst; }

                    this.format = function(userFormat) {

                        var format = userFormat != undefined ? userFormat : "m:s";
                        var formatSplit = format.split(":");
                        periodSuperiority = "";

                        switch(true) {
                            case formatSplit.indexOf("d") != -1:
                                periodSuperiority = "d";
                                break;
                            case formatSplit.indexOf("h") != -1:
                                periodSuperiority = "h";
                                break;
                            case formatSplit.indexOf("m") != -1:
                                periodSuperiority = "m";
                                break;
                            case formatSplit.indexOf('s') != -1:
                                periodSuperiority = "s";
                                break;
                            default:
                                periodSuperiority = "ms";
                        }

                        return formatDuration(format)
                    };

                    //private methods
                    function initInterval() {

                        var started = moment();

                        innerInterval = $interval(function() {
                            var diff = moment().diff(started);
                            durationInst.add(diff, 'ms');

                            started = moment();
                        }, 50);

                    }

                    function formatDuration(format) {
                        var resultArr = [];
                        var formatSplit = format.split(":");
                        var msIndex = formatSplit.indexOf('ms');

                        if (msIndex != -1) formatSplit.splice(msIndex, 1);


                        for(var i in formatSplit) {

                            resultArr.push(
                                formatTwoDigitsValue(
                                    periodSuperiority == formatSplit[i] ?
                                    durationInst.as(formatSplit[i]) :
                                        durationInst[durationFnBinding[formatSplit[i]]]()
                                )
                            );
                        }

                        if (msIndex != -1) {
                            resultArr.splice(
                                msIndex, 0, formatThreeDigitsValue(
                                    periodSuperiority == 'ms' ? durationInst.as('ms') : durationInst.milliseconds()
                                )
                            )
                        }

                        function formatTwoDigitsValue(val) {

                            var value = normalizeValue(val);

                            return value < 10 ? "0" + value : value
                        }

                        function formatThreeDigitsValue(val) {

                            var value = normalizeValue(val);

                            return value > 100 ? value :
                                value > 10 ? "0" + value : "00" + value;
                        }

                        function normalizeValue(val) {
                            return val < 0 ? Math.abs(Math.ceil(val)) :  Math.floor(val);
                        }

                        return resultArr.join(":");
                    }

                    if (freezeStart !== true) initInterval();

                };

                var returnObj = new Timer();
                TimerInstances[key] = returnObj;

                return returnObj
            },
            resetAll: function() {
                self.traverseAndExecute("reset");
            },
            stopAll: function() {
                self.traverseAndExecute("stop");
            },
            removeAll: function() {
                self.traverseAndExecute("remove");
            },
            resumeAll: function() {
                self.traverseAndExecute("resume");
            },
            traverseAndExecute: function(fn) {
                for(var i in TimerInstances) {
                    TimerInstances[i][fn]();
                }
            }
        };

        return self;
    }

})();
