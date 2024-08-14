package br.dev.ci.MobManager.client.model;

public class PhoneNumber {
    String number;
    Device device;

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public Device getDevice() {
        return device;
    }

    public void setDevice(Device device) {
        this.device = device;
    }
}
