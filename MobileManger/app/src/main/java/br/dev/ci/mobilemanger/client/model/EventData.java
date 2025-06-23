package br.dev.ci.mobilemanger.client.model;

import java.util.HashMap;

public class EventData  {
    private String client;
    private String setOrigem;
    private HashMap<String, Change> changes;
    private Long momentum;
    private Long lastPing;
    private String type;

    public HashMap<String, Change> getChanges() {
        return changes;
    }

    public void setChanges(HashMap<String, Change> changes) {
        this.changes = changes;
    }

    public String getSetOrigem() {
        return setOrigem;
    }

    public void setSetOrigem(String setOrigem) {
        this.setOrigem = setOrigem;
    }

    public String getClient() {
        return client;
    }

    public void setClient(String client) {
        this.client = client;
    }

    public Long getMomentum() {
        return momentum;
    }

    public void setMomentum(Long momentum) {
        this.momentum = momentum;
    }

    public Long getLastPing() {
        return lastPing;
    }

    public void setLastPing(Long lastPing) {
        this.lastPing = lastPing;
    }


    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
