package br.dev.ci.mobmanager.client.model;

public class Change {
    private Object previousValue;
    private Object currentValue;
    private Boolean firstChange;

    public Object getPreviousValue() {
        return previousValue;
    }

    public void setPreviousValue(Object previousValue) {
        this.previousValue = previousValue;
    }

    public Object getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(Object currentValue) {
        this.currentValue = currentValue;
    }

    public Boolean getFirstChange() {
        return firstChange;
    }

    public void setFirstChange(Boolean firstChange) {
        this.firstChange = firstChange;
    }
}
