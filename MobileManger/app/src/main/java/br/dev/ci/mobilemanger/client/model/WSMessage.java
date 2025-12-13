package br.dev.ci.mobilemanger.client.model;

import java.math.BigDecimal;

public class WSMessage {
    private String event;
    private String type;
    private BigDecimal wait;
    private BigDecimal momento;
    private BigDecimal globalPing;
    private BigDecimal pingMedium;

    public String getEvent() {
        return event;
    }

    public void setEvent(String event) {
        this.event = event;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getWait() {
        return wait;
    }

    public void setWait(BigDecimal wait) {
        this.wait = wait;
    }

    public BigDecimal getMomento() {
        return momento;
    }

    public void setMomento(BigDecimal momento) {
        this.momento = momento;
    }

    public BigDecimal getGlobalPing() {
        return globalPing;
    }

    public void setGlobalPing(BigDecimal globalPing) {
        this.globalPing = globalPing;
    }

    public BigDecimal getPingMedium() {
        return pingMedium;
    }

    public void setPingMedium(BigDecimal pingMedium) {
        this.pingMedium = pingMedium;
    }
}
