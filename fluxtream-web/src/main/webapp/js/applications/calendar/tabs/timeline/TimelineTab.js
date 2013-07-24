define(["core/Tab", "core/FlxState", "core/grapher/Grapher",
        "applications/calendar/App"],
    function(Tab, FlxState, Grapher, Calendar) {

    var timelineTab = new Tab("calendar", "timeline", "Candide Kemmler", "icon-film", false);
    var digest;
    var grapher = null;
    var connectorEnabled;
    var channelStates = {};

    function connectorDisplayable(connector){
        return connector.channelNames.length != 0;
    }

    function connectorsAlwaysEnabled(){
        return true;
    }

    var targetTime = null;

    function render(params) {
        targetTime = params.tabParam;
        params.setTabParam(null);
        digest = params.digest;
        connectorEnabled = params.connectorEnabled;
        this.getTemplate("text!applications/calendar/tabs/timeline/template.html", "timeline", function() {
            setup(digest, params.timeUnit);
            if (Calendar.timeRange.updated) {
                grapher.setRange(Calendar.timeRange.start / 1000, Calendar.timeRange.end / 1000);
                Calendar.timeRange.updated = false;
            }
            params.doneLoading();
        });
    }

    /**
     * Updates Calendar state in response to a change in grapher.dateAxis. This
     * fires for user dateAxis dragging.
     *
     * <p>
     * Inertia is implemented by checking the state that would be generated by moving
     * the date axis somewhat to the left and somewhat to the right (by dateChangeInertia),
     * and by comparing those states to the most recently set state (the prevState parameter).
     * Only if the prevState parameter differs from both will this make a change to the
     * state.
     * </p>
     */
    function onAxisChanged(prevState) {
        var timeUnit = grapher.getCurrentTimeUnit();
        var center = (grapher.dateAxis.getMin() + grapher.dateAxis.getMax()) / 2.0;
        var date = new Date(center * 1000);

        var dateChangeInertia = 24 * 3600 * 1000 / 12;
        var dateEarly = new Date(center * 1000 - dateChangeInertia);
        var dateLate = new Date(center * 1000 + dateChangeInertia);

        var state = Calendar.toState("timeline", timeUnit, date);
        var stateEarly = Calendar.toState("timeline", timeUnit, dateEarly);
        var stateLate = Calendar.toState("timeline", timeUnit, dateLate);

        var prevTabState = prevState == null ? null : prevState.tabState;

        if (state.tabState != prevTabState
                && stateEarly.tabState != prevTabState
                && stateLate.tabState != prevTabState) {
            Calendar.changeTabState(state, false);
            Calendar.timespanInited = false; // Need to be ready to refresh the date display if user hits back button
            return state;
        }

        return prevState;
    }

    function setup(digest, timeUnit) {
        if (grapher !== null) {
            $(window).resize();
            for (var connectorName in connectorEnabled){
                connectorToggled(connectorName,null,connectorEnabled[connectorName]);
            }
            if (targetTime != null){
                grapher.setTimeCursorPosition(targetTime / 1000);
            }
            return;
        }
        grapher = new Grapher($("#timelineTabContainer"), {onLoadActions: [function() {
            for (var connectorName in connectorEnabled){
                connectorToggled(connectorName,null,connectorEnabled[connectorName]);
            }
            var state = null;
            grapher.dateAxis.addAxisChangeListener(function() {
                // NOTE: we use $.doTimeout() here to avoid spamming onAxisChanged().
                // This will fire 100ms after the user stops dragging, since
                // $.doTimeout() cancels earlier timeouts with the same name.
                $.doTimeout("TimelineTabAxisChange");//cancel previous doTimeout
                $.doTimeout('TimelineTabAxisChange', 100, function() {//schedule a new one
                    state = onAxisChanged(state);
                });
            });
            if (targetTime == null)
                targetTime = (Calendar.timeRange.start + Calendar.timeRange.end) / 2;
            grapher.setTimeCursorPosition(targetTime / 1000);
        }]});
    }

    function connectorToggled(connectorName,objectTypeNames,enabled){

        var found = false;

        $.each(digest.selectedConnectors, function(i, connector) {
            if (connectorName !== connector.connectorName) {
                return true;
            }
            found = true;
            if (channelStates[connectorName] == null)
                channelStates[connectorName] = {};
            var channels = connector.channelNames;


            for (var channelName in channelStates[connectorName]){
                if (channels.indexOf(channelName) == -1){
                    if (channelStates[connectorName][channelName]){
                        grapher.removeChannel(channelName);
                    }
                    delete channelStates[connectorName][channelName];
                }
            }
            for (var i = 0, li = channels.length; i < li; i++){
                if (channelStates[connectorName][channels[i]] == null)
                    channelStates[connectorName][channels[i]] = false;
            }


            return false;
        });

        if (!found){
            enabled = false;
        }
        for (var channel in channelStates[connectorName]){
            if (channelStates[connectorName][channel] === enabled)
                continue;
            if (enabled) {
                grapher.addChannel(channel);
            } else {
                grapher.removeChannel(channel);
            }
            channelStates[connectorName][channel] = enabled;
        }
    }

    timelineTab.initialized = false;
    timelineTab.render = render;
    timelineTab.connectorToggled = connectorToggled;
    timelineTab.connectorDisplayable = connectorDisplayable;
    timelineTab.connectorsAlwaysEnabled = connectorsAlwaysEnabled;
    return timelineTab;
});