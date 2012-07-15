define(function() {

    function DashboardWidget() {}

    DashboardWidget.prototype.load = function(widgetInfo, dgst, dashboardId) {
        this.manifest = widgetInfo.manifest;
        this.digest = dgst;
        this.dashboardId = dashboardId;
        _.bindAll(this);
        this.init();
        if (this.manifest.HasSettings) {
            this.settings = widgetInfo.settings;
            var that = this;
            $("#" + widgetInfo.manifest.WidgetName + "-widget-settings").click(function () {
                that.showSettingsDialog(that.settings);
            });
        }
    }

    DashboardWidget.prototype.showSettingsDialog = function(settings) {
        var that = this;
        App.loadMustacheTemplate("applications/calendar/tabs/dashboards/dashboardsTabTemplates.html","widgetSettings",function(template) {
            var html = template.render({"manifest" : that.manifest});
            App.makeModal(html);
            that.loadWidgetSettingsForm();
            $("#save-settings-" + that.manifest.WidgetName).click(function() {
                that.validateSettings();
            });
        });
    }

    DashboardWidget.prototype.validateSettings = function() {
        alert("WARNING: '" + this.manifest.WidgetName + "' widget's validateSettings()  method is not yet implemented!");
    }

    DashboardWidget.prototype.saveSettings = function(settings) {
        var that = this;
        $.ajax({
            url: "/api/dashboards/" + that.dashboardId + "/widgets/" + that.manifest.WidgetName + "/settings",
            type: "POST",
            data: {settingsJSON : JSON.stringify(settings)},
            success: function() {
                App.closeModal();
            },
            error: function() {
                alert("Oops. We couldn't save your settings. Sorry about that.")
            }
        });
    }

    DashboardWidget.prototype.loadWidgetSettingsForm = function() {
        var that = this;
        require(["text!" + this.manifest.WidgetRepositoryURL + "/"
                     + this.manifest.WidgetName + "/settings.mustache"], function(html) {
            var selector = "#" + that.manifest.WidgetName + "-widgetSettings";
            $(selector).replaceWith(html);
            that.loadWidgetSettingsData();
        });
    }

    DashboardWidget.prototype.loadWidgetSettingsData = function() {
        var that = this;
        $.ajax({
            url: "/api/dashboards/" + that.dashboardId + "/widgets/" + that.manifest.WidgetName + "/settings",
            type: "GET",
            success: function(widgetSettings) {
                that.defaultSettings(widgetSettings);
                that.bindWidgetSettings(widgetSettings);
            },
            error: function() {
                alert("Oops. We couldn't get your settings. Sorry about that.")
            }
        })
    }

    DashboardWidget.prototype.bindWidgetSettings = function(widgetSettings) {
        alert("WARNING: '" + this.manifest.WidgetName + "' widget's bindWidgetSettings()  method is not yet implemented!");
    }

    DashboardWidget.prototype.defaultSettings = function(widgetSettings) {
        alert("WARNING: '" + this.manifest.WidgetName + "' widget's defaultSettings()  method is not yet implemented!");
    }

    DashboardWidget.prototype.addCommas = function(nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    };

    DashboardWidget.prototype.getPrettyTimeUnit = function() {
        var unit = this.getTimeUnit();
        switch (unit) {
            case "DAY":
                return "Today";
            case "WEEK":
                return "This Week";
            default:
                return "This Year";
        }
    }

    DashboardWidget.prototype.getTimeUnit=function() {
        var ONE_DAY = 3600000*24;
        if (this.digest.tbounds.end-this.digest.tbounds.start===ONE_DAY-1)
            return "DAY";
        else if (this.digest.tbounds.end-this.digest.tbounds.start===7*ONE_DAY-1)
            return "WEEK";
        else return "YEAR";
    }

    return DashboardWidget;

});