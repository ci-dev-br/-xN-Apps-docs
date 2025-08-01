package br.dev.ci.mobmanager.client.model;

public class EventPayload {
    private String event;
    private EventData data;

    public EventData getData() {
        return data;
    }

    public void setData(EventData data) {
        this.data = data;
    }

    public String getEvent() {
        return event;
    }

    public void setEvent(String event) {
        this.event = event;
    }
}
