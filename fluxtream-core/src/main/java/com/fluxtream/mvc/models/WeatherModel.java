package com.fluxtream.mvc.models;

import java.util.List;
import com.fluxtream.domain.GuestSettings;
import com.fluxtream.domain.metadata.WeatherInfo;

public class WeatherModel {

    public SolarInfoModel solarInfo;
    public List<WeatherInfo> hourlyWeatherData = null;
	public TimeBoundariesModel tbounds;
    public float minTempC, maxTempC;
    public float minTempF, maxTempF;
    public GuestSettings.TemperatureUnit temperatureUnit;

    public WeatherModel(final GuestSettings.TemperatureUnit temperatureUnit) {
        this.temperatureUnit = temperatureUnit;
    }
}
