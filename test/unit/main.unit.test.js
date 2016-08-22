/// <reference path="../../bower_components/karma/lib/cli.js" />

describe("PashaSk Timer directive unit tests", function() {

    var $scope, $psTimer, $timeout, $interval, timerInst;

    beforeEach(module('ps.timer'));
    beforeEach(inject(function(_$rootScope_, _psTimer_, _$timeout_, _$interval_) {
        $scope = _$rootScope_.$new();
        $psTimer = _psTimer_;
        $timeout = _$timeout_;
        $interval = _$interval_;

        timerInst = $psTimer.initTimer();
    }));

    it("initial() testing", function() {
        var timerInst = $psTimer.initTimer();
        expect(moment.isDuration(timerInst.duration())).toBe(true);

    });

    it("testing stop()", function() {
        $interval.flush(100000);
        timerInst.stop();
        var ms1 = timerInst.duration().milliseconds();

        $interval.flush(100000);
        var ms2 = timerInst.duration().milliseconds();

        console.log('ms1', ms1);
        console.log('ms2', ms2);

        expect(ms1).toBe(ms2);
    });

    it("testing resume()", function() {
        $interval.flush(100000);
        timerInst.stop();
        var ms1 = timerInst.duration().milliseconds();

        timerInst.resume();
        $interval.flush(100000);
        var ms2 = timerInst.duration().milliseconds();

        console.log('ms1', ms1);
        console.log('ms2', ms2);

        expect(ms1).not.toBe(ms2);
    });

    it("testing reset()", function() {

        $interval.flush(100000);
        var ms1 = timerInst.duration().as('ms');

        console.log("ms1", ms1);
        timerInst.stop();
        timerInst.reset();

        ms1 = timerInst.duration().as('ms');

        console.log("ms1", ms1);
        expect(ms1).toBe(0);
    });

    it("shifting test", function(done) {

        jasmine.clock().install();

        setInterval(function() {
            var ms1 = timerInst.duration().as('ms');

            if (ms1 >= 20) {
                timerInst.stop();
                console.log("shifting with 20ms");
                timerInst.shift({ms: 20});
                var ms2 = timerInst.duration().as('ms');

                expect(ms2).toBe(ms1 + 20);
                done();
            }

            $interval.flush(1);
        }, 1);

        jasmine.clock().tick(5000);
    });

    it("shifting below zero", function(done) {
        timerInst.shift({ms: -20});

        setInterval(function() {

            var ms1 = timerInst.duration().as('ms');

            if (ms1 > 0) {
                console.log("shifting below zero - means duration become a countdown");
                done();
            }

            $interval.flush(1);
        }, 1);

        jasmine.clock().tick(5000);
    });

    it("testing freezeStart option", function() {
        var timer2Inst = $psTimer.initTimer({}, true);
        $interval.flush(10000);

        var ms1 = timer2Inst.duration().as('ms');
        console.log('ms1=', ms1)
        expect(ms1).toBe(0);
    });

    it("testing remove()", function() {
        $interval.flush(10000);
        timerInst.remove();


        expect(timerInst.isRemoved).toBe(true);
        expect(timerInst.obj).toBe(undefined);
    })

    it("testing stopAll()", function () {

        console.log('testing stopall()');

        var instances = [];
        var compared = [];
        for (var i in [1, 2, 3]) {
            instances[i] = $psTimer.initTimer();
            $interval.flush(1000);
        }

        $psTimer.stopAll();

        for (var i in [1, 2, 3]) {
            compared[i] = instances[i].duration().as('ms');
        }

        $interval.flush(10000);

        for (var i in [1, 2, 3]) {
            expect(instances[i].duration().as('ms')).toBe(compared[i]);
        }
    });

    it("testing removeAll()", function() {

        console.log('testing removeall()');

        var instances = [];

        for (var i in [1, 2, 3]) {
            instances[i] = $psTimer.initTimer();
            $interval.flush(1000);
        }

        $psTimer.removeAll();

        for (var i in [1, 2, 3]) {
            expect(instances[i].isRemoved).toBe(true);
        }
    })
});