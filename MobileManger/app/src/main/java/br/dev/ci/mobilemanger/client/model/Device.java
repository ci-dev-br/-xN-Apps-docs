package br.dev.ci.mobilemanger.client.model;

import java.util.ArrayList;
import java.util.List;

public class Device {
    private String id;
    private String name;
    private String applicationId;
    private String model;
    private String authentication;
    private String mac;
    private ArrayList<PhoneNumber> numbers;
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getApplicationId() {
        return applicationId;
    }
    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }
    public String getModel() {
        return model;
    }
    public void setModel(String model) {
        this.model = model;
    }
    public String getAuthentication() {
        return authentication;
    }
    public void setAuthentication(String authentication) {
        this.authentication = authentication;
    }
    public List<PhoneNumber> getNumbers() {
        return numbers;
    }
    public void setNumbers(ArrayList<PhoneNumber> phones) {
        this.numbers = phones;
    }
    public void setMac(String value){
        this.mac = value;
    }
    public String getMac() {
        return this.mac;
    }

}
